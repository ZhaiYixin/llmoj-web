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
import { ref, watch } from "vue";
import { getDocument, GlobalWorkerOptions, TextLayer } from 'pdfjs-dist';
import { throttle } from "lodash";
import { Mutex } from "async-mutex";
import type { PDFDocumentProxy } from "pdfjs-dist";
import 'pdfjs-dist/web/pdf_viewer.css';

GlobalWorkerOptions.workerSrc = "/node_modules/pdfjs-dist/build/pdf.worker.min.mjs";

let pdfDoc: PDFDocumentProxy | null = null;
const renderLocks = new Map<number, Mutex>(); // 防止在渲染某一页canvas的时候又发起渲染
const pageStatus = new Map<number, { timestamp: number; rendered: number }>(); // 已加载的页，懒加载不要重新加载
let globalTimestamp = 0; // 保证pageStatus不被旧的操作所覆盖
let pageDefaultProperties = {
  width: 595, // 页面在未渲染情况下的宽高
  height: 842,
}

const pdfNumPages = defineModel<number>('numPages', { default: 1 }); // pdf总页数
const currentWatchingPage = defineModel<number>('current', { default: 1 }); // 用户当前正在观看的页的页码
const currentScale = defineModel<number>('scale', { default: 1 }); // 缩放比例
const currentRotation = defineModel<number>('rotation', { default: 0 }); // 旋转角度
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
  const viewport = page.getViewport({ scale: currentScale.value, rotation: currentRotation.value });
  setPageWidthHeightIfChanged(viewport.width, viewport.height);
  setCanvasProperties(canvas, canvasContext, viewport.width, viewport.height);

  // 开始渲染
  try {
    const renderTask = page.render({ canvasContext: canvasContext, viewport: viewport });
    await renderTask.promise;
  } catch (error) {
    console.error(`Error rendering page ${pageNum}:`, error);
  }

  // 渲染文本
  const textLayerDiv = document.getElementById(`pdf-text-layer-${pageNum}`) as HTMLDivElement;
  if (!textLayerDiv) return;
  try {
    const textContent = await page.getTextContent();
    const textLayer = new TextLayer({
      textContentSource: textContent,
      viewport: viewport,
      container: textLayerDiv,
    });
    await textLayer.render();
    setTextLayerProperties(textLayerDiv, viewport.scale, viewport.width, viewport.height);
  } catch (error) {
    console.error(`Error rendering text layer for page ${pageNum}:`, error);
  }
};

const renderPageWithLock = async (pageNum: number) => {
  // 防止对同一个canvas同时进行多个操作
  let mutex = renderLocks.get(pageNum);
  if (!mutex) {
    mutex = new Mutex();
    renderLocks.set(pageNum, mutex);
  }
  const release = await mutex.acquire();
  try {
    const timestamp = ++globalTimestamp;
    pageStatus.set(pageNum, { timestamp: timestamp, rendered: 1 });
    await renderPage(pageNum);
    const latestPageStatus = pageStatus.get(pageNum);
    if (latestPageStatus && latestPageStatus.timestamp <= timestamp) {
      pageStatus.set(pageNum, { timestamp: timestamp, rendered: 2 });
    }
  } finally {
    release();
  }
};

const lazyRenderPdf = (pageNum: number, radius: number = 1, rendered: number = 1) => {
  // 如果未渲染的话，渲染PDF的某页以及临近的几页

  // 渲染半径取决于`radius`（单位是屏幕）
  const container = pdfContainerRef.value;
  if (!container) return;
  const pageHeight = pageDefaultProperties.height || 10000;
  const containerHeight = container.clientHeight;
  const pagesPerScreen = Math.ceil(containerHeight / pageHeight);
  const neighbors = Math.ceil(radius * pagesPerScreen);

  // 是否渲染某页还取决于`rendered`，不重新渲染那些渲染程度高的页
  const start = Math.max(1, pageNum - neighbors);
  const end = Math.min(pdfNumPages.value, pageNum + neighbors);
  for (let i = start; i <= end; i++) {
    const s = pageStatus.get(i);
    if (s && s.rendered >= rendered) continue;
    renderPageWithLock(i);
  }
};

const reRenderPdf = () => {
  // 清空之前的渲染
  pageStatus.clear();
  lazyRenderPdf(currentWatchingPage.value, 0.5, 10000);
}

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

const setTextLayerProperties = (textLayerDiv: HTMLElement, scale: number, width: number, height: number) => {
  // 设置textLayer属性
  // 文字缩放
  textLayerDiv.style.setProperty('--total-scale-factor', scale.toString());
  // 处理pdf旋转时textLayerDiv没有旋转的情况（似乎是pdf.js的Bug？）
  const isRotated = currentRotation.value === 90 || currentRotation.value === 270;
  if (isRotated) {
    [width, height] = [height, width];
    textLayerDiv.style.width = `${Math.floor(width)}px`;
    textLayerDiv.style.height = `${Math.floor(height)}px`;
  }
}

const setPageWidthHeight = (width: number, height: number) => {
  // 设置pdf全部未渲染页面的宽高

  // 由于整个容器宽高变化，所以相对位置会变化，需要事先保存和事后恢复
  const savedPosition = saveScrollPositionRatio();

  pageDefaultProperties = { width: width, height: height };
  for (let i = 1; i <= pdfNumPages.value; i++) {
    const s = pageStatus.get(i)
    if (s && s.rendered >= 2) continue;
    const pageDom = document.getElementById(`pdf-page-${i}`) as HTMLElement;
    if (!pageDom) continue;
    const canvas = pageDom.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      canvas.style.width = `${Math.floor(width)}px`;
      canvas.style.height = `${Math.floor(height)}px`;
    }
    const textLayer = pageDom.querySelector('.textLayer') as HTMLDivElement;
    if (textLayer) {
      textLayer.style.width = `${Math.floor(width)}px`;
      textLayer.style.height = `${Math.floor(height)}px`;
    }
  }

  restoreScrollPositionRatio(savedPosition);
};

const setPageWidthHeightIfChanged = (width: number, height: number) => {
  // 只在宽高变化时才重新设置
  if (pageDefaultProperties.width == width && pageDefaultProperties.height == height) return;
  setPageWidthHeight(width, height);
}

const saveScrollPositionRatio = () => {
  // 保存相对于容器的位置
  const container = pdfContainerRef.value;
  if (!container) return null;
  const scrollTop = container.scrollTop;
  const scrollLeft = container.scrollLeft;
  const scrollHeight = container.scrollHeight;
  const scrollWidth = container.scrollWidth;
  return {
    topRatio: scrollTop / scrollHeight,
    leftRatio: scrollLeft / scrollWidth,
  };
};

const restoreScrollPositionRatio = (savedPosition: { topRatio: number; leftRatio: number } | null) => {
  // 恢复相对于容器的位置
  const container = pdfContainerRef.value;
  if (!container || !savedPosition) return;
  const { topRatio, leftRatio } = savedPosition;
  const newScrollTop = Math.round(topRatio * container.scrollHeight);
  const newScrollLeft = Math.round(leftRatio * container.scrollWidth);
  container.scrollTo({ top: newScrollTop, left: newScrollLeft, });
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

const onPdfContainerScroll = throttle(() => {
  const current = calCurrentWatchingPage();
  if (current) {
    currentWatchingPage.value = current;
  }
}, 100);

watch(currentWatchingPage, () => {
  lazyRenderPdf(currentWatchingPage.value);
});

watch(currentScale, () => {
  reRenderPdf();
});

watch(currentRotation, () => {
  reRenderPdf();
});

const load = async (pdfUrl: string) => {
  // 加载pdf
  await initPdfLoader(pdfUrl);
  lazyRenderPdf(1);
};

const jumpToPage = async (pageNum: number) => {
  // 跳转到某一页
  pageNum = Math.max(1, Math.min(pdfNumPages.value, pageNum));
  currentWatchingPage.value = pageNum;
  if (!pdfContainerRef.value) return;
  const pageDom = document.getElementById(`pdf-page-${pageNum}`) as HTMLElement;
  if (!pageDom) return;
  const pageTop = pageDom.offsetTop;
  const top = pageTop - 16;
  pdfContainerRef.value.scrollTo({ top: top, });
};

const scaleFit = async (mode: 'width' | 'height', pageNum: number = 1) => {
  // 缩放使得页面宽度（高度）适应屏幕宽度（高度）
  const container = pdfContainerRef.value;
  if (!container) return;
  const containerWidth = container.clientWidth - 32;
  const containerHeight = container.clientHeight - 40;

  const page = await pdfDoc!.getPage(pageNum);
  const pagePrimitiveWidth = page.view[2] - page.view[0];  // page.view[2] - page.view[0] 是页面的原始宽度
  const pagePrimitiveHeight = page.view[3] - page.view[1];  // page.view[3] - page.view[1] 是页面的原始高度
  const isRotated = currentRotation.value === 90 || currentRotation.value === 270;
  const _pagePrimitiveWidth = isRotated ? pagePrimitiveHeight : pagePrimitiveWidth;
  const _pagePrimitiveHeight = isRotated ? pagePrimitiveWidth : pagePrimitiveHeight;

  if (mode == 'width') {
    currentScale.value = containerWidth / _pagePrimitiveWidth;
  } else {
    currentScale.value = containerHeight / _pagePrimitiveHeight;
  }
}

defineExpose({ load, jumpToPage, scaleFit });
</script>

<style scoped>
.pdf-container {
  position: relative;
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
  background-color: white;
}

.pdf-canvas {
  display: block;
}
</style>
