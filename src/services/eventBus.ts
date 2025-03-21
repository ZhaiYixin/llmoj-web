import mitt from 'mitt'

type Events = {
  showLoginModal: void
  loginSuccess: void
  loginCancel: void
}

const eventBus = mitt<Events>()

export default eventBus
