<template>
  <div class="pdf-container" ref="pdfContainerRef" @scroll="onPdfContainerScroll">
    <div class="pdf-container-inner">
      <div v-for="i in pdfNumPages" :id="`pdf-page-${i}`" :key="i" class="pdf-page">
        <canvas :id="`pdf-canvas-${i}`" class="pdf-canvas" />
        <div :id="`pdf-text-layer-${i}`" class="textLayer"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 部分参考了https://juejin.cn/post/7277475232320536633
// 部分参考了https://zhuanlan.zhihu.com/p/128127757
import { ref, reactive, watch } from "vue";
import { getDocument, GlobalWorkerOptions, TextLayer } from 'pdfjs-dist';
import { debounce } from "lodash";
import type { PDFDocumentProxy } from "pdfjs-dist";
import 'pdfjs-dist/web/pdf_viewer.css';

GlobalWorkerOptions.workerSrc = "/node_modules/pdfjs-dist/build/pdf.worker.min.mjs";

let pdfDoc: PDFDocumentProxy | null = null;
const renderLocks = new Map<number, Promise<void>>(); // 防止在渲染某一页canvas的时候又发起渲染

const pdfNumPages = ref(0); // pdf总页数
const currentWatchingPage = ref(0); // 用户当前正在观看的页的页码
const currentScale = ref(1); // 缩放比例
const currentRotation = ref(0); // 旋转角度
const pageIsRendered = reactive<Record<number, boolean>>({}); // 页面是否已渲染
const canvasDefaultProperties = reactive({
  styleWidth: 0, // 页面在未渲染情况下的宽高
  styleHeight: 0,
});
const pdfContainerRef = ref<HTMLElement | null>(null);

const initPdfLoader = async (src: string) => {
  // 加载pdf文件
  const loadingTask = getDocument(src);
  const pdf = await loadingTask.promise;
  pdf.loadingParams.disableAutoFetch = true;
  pdf.loadingParams.disableStream = true;
  pdfDoc = pdf; // 保存加载的pdf文件流
  pdfNumPages.value = pdf.numPages; // 获取pdf文件的总页数
};

const renderPage = async (pageNum: number) => {
  const page = await pdfDoc!.getPage(pageNum);
  page.cleanup();
  const canvas = document.getElementById(`pdf-canvas-${pageNum}`) as HTMLCanvasElement;
  if (!canvas) return;
  const canvasContext = canvas.getContext("2d");
  if (!canvasContext) return;
  // currentScale.value = pdfContainerRef.value ? pdfContainerRef.value.clientWidth / (page.view[2] - page.view[0]) : 1; // page.view[2] - page.view[0] 是页面的原始宽度
  const viewport = page.getViewport({ scale: currentScale.value, rotation: currentRotation.value });
  setCanvasProperties(canvas, canvasContext, viewport.width, viewport.height);

  // 开始渲染
  try {
    const renderTask = page.render({ canvasContext: canvasContext, viewport: viewport });
    await renderTask.promise;
    pageIsRendered[pageNum] = true;
    canvasDefaultProperties.styleWidth = viewport.width;
    canvasDefaultProperties.styleHeight = viewport.height;
  } catch (error) {
    console.error(`Error rendering page ${pageNum}:`, error);
  }

  // 渲染文本
  const textLayerDiv = document.getElementById(`pdf-text-layer-${pageNum}`) as HTMLDivElement;
  if (!textLayerDiv) return;
  try {
    const textContent = await page.getTextContent();
    textLayerDiv.style.setProperty('--total-scale-factor', viewport.scale.toString());
    const textLayer = new TextLayer({
      textContentSource: textContent,
      viewport: viewport,
      container: textLayerDiv,
    });
    await textLayer.render();
    if (currentRotation.value == 90 || currentRotation.value == 270) {
      textLayerDiv.style.width = `${viewport.height}px`;
      textLayerDiv.style.height = `${viewport.width}px`;
    }
  } catch (error) {
    console.error(`Error rendering text layer for page ${pageNum}:`, error);
  }
};

const renderPageWithLock = async (pageNum: number) => {
  // 防止对同一个canvas同时进行多个操作
  if (renderLocks.has(pageNum)) return renderLocks.get(pageNum);
  const renderPromise = renderPage(pageNum).catch((error) => {
    console.error(`Error rendering page ${pageNum}:`, error);
    throw error;
  }).finally(() => {
    renderLocks.delete(pageNum);
  });
  renderLocks.set(pageNum, renderPromise);
  return renderPromise;
};

const lazyRenderPdf = debounce((pageNum: number) => {
  // 如果未渲染的话，渲染PDF的某页以及临近的几页
  const radius = 2;
  const start = Math.max(1, pageNum - radius);
  const end = Math.min(pdfNumPages.value, pageNum + radius);
  for (let i = start; i <= end; i++) {
    if (pageIsRendered[i]) continue;
    renderPageWithLock(i);
  }
}, 100);

const setCanvasProperties = (canvas: HTMLCanvasElement, canvasContext: CanvasRenderingContext2D, width: number, height: number) => {
  // 设置canvas属性，同时保证清晰度
  const dpr = window.devicePixelRatio || 1; // 针对高分辨率屏幕
  const bsr = canvasContext.webkitBackingStorePixelRatio || canvasContext.mozBackingStorePixelRatio || canvasContext.msBackingStorePixelRatio || canvasContext.oBackingStorePixelRatio || canvasContext.backingStorePixelRatio || 1;
  const ratio = dpr / bsr;
  canvas.width = Math.floor(width * ratio); // 画布尺寸
  canvas.height = Math.floor(height * ratio);
  canvasContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  canvas.style.width = `${Math.floor(width)}px`; // 画板尺寸
  canvas.style.height = `${Math.floor(height)}px`;
};

const calCurrentWatchingPage = () => {
  // 计算当前观看的页是第几页
  if (!pdfContainerRef.value) return 0;
  const scrollTop = pdfContainerRef.value.scrollTop;
  const containerHeight = pdfContainerRef.value.clientHeight;
  const centerY = scrollTop + containerHeight / 2;
  for (let i = 1; i <= pdfNumPages.value; i++) {
    const pageDom = document.getElementById(`pdf-page-${i}`) as HTMLElement;
    if (pageDom) {
      const top = pageDom.offsetTop;
      const height = pageDom.offsetHeight;
      if (top <= centerY && centerY < top + height) {
        return i;
      }
    }
  }
  return 0;
};

const onPdfContainerScroll = debounce(() => {
  currentWatchingPage.value = calCurrentWatchingPage();
}, 100);

watch(canvasDefaultProperties, () => {
  // 设置未渲染页面的宽高
  for (let i = 1; i <= pdfNumPages.value; i++) {
    if (pageIsRendered[i]) continue;
    const canvas = document.getElementById(`pdf-canvas-${i}`) as HTMLCanvasElement;
    if (!canvas) continue;
    canvas.style.width = `${canvasDefaultProperties.styleWidth}px`;
    canvas.style.height = `${canvasDefaultProperties.styleHeight}px`;
  }
});

watch(currentWatchingPage, () => {
  lazyRenderPdf(currentWatchingPage.value);
});

watch(currentScale, () => {
  Object.keys(pageIsRendered).forEach(key => {
    delete pageIsRendered[key];
  });
  lazyRenderPdf(currentWatchingPage.value);
});

watch(currentRotation, () => {
  Object.keys(pageIsRendered).forEach(key => {
    delete pageIsRendered[key];
  });
  lazyRenderPdf(currentWatchingPage.value);
});

const load = async (pdfUrl: string) => {
  // 加载pdf
  await initPdfLoader(pdfUrl);
  jumpToPage(1);
};

const jumpToPage = async (pageNum: number) => {
  // 跳转到某一页
  pageNum = Math.max(1, Math.min(pdfNumPages.value, pageNum));
  currentWatchingPage.value = pageNum;
  lazyRenderPdf(pageNum);
  if (!pdfContainerRef.value) return;
  const canvas = document.getElementById(`pdf-canvas-${pageNum}`) as HTMLCanvasElement;
  if (!canvas) return;
  const top = canvas.offsetTop;
  pdfContainerRef.value.scrollTo({ top: top, });
};

defineExpose({ currentWatchingPage, load, jumpToPage });
</script>

<style scoped>
.pdf-container {
  overflow-y: auto;
  overflow-x: auto;
}

.pdf-container-inner {
  margin: 0 auto;
  padding: 16px;
  width: max-content;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.pdf-page {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  width: max-content;
  position: relative;
}

.pdf-canvas {
  display: block;
}
</style>
