type Point = { x: number; y: number }

export function createAim(props: {
  enabled: () => boolean
  active: () => string | undefined
  el: () => HTMLElement | undefined
  onActivate: (id: string) => void
  direction?: () => "left" | "right"
  delay?: number
  max?: number
  tolerance?: number
  edge?: number
}) {
  const state = {
    locs: [] as Point[],
    timer: undefined as number | undefined,
    pending: undefined as string | undefined,
    over: undefined as string | undefined,
    last: undefined as Point | undefined,
  }

  const delay = props.delay ?? 250
  const max = props.max ?? 4
  const tolerance = props.tolerance ?? 80
  const edge = props.edge ?? 18

  const cancel = () => {
    if (state.timer !== undefined) clearTimeout(state.timer)
    state.timer = undefined
    state.pending = undefined
  }

  const reset = () => {
    cancel()
    state.over = undefined
    state.last = undefined
    state.locs.length = 0
  }

  const move = (event: MouseEvent) => {
    if (!props.enabled()) return
    const el = props.el()
    if (!el) return

    const rect = el.getBoundingClientRect()
    const x = event.clientX
    const y = event.clientY
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return

    state.locs.push({ x, y })
    if (state.locs.length > max) state.locs.shift()
  }

  const wait = () => {
    if (!props.enabled()) return 0
    if (!props.active()) return 0

    const el = props.el()
    if (!el) return 0
    if (state.locs.length < 2) return 0

    const rect = el.getBoundingClientRect()
    const latest = state.locs[state.locs.length - 1]
    if (!latest) return 0

    const first = state.locs[0] ?? latest
    if (first.x < rect.left || first.x > rect.right || first.y < rect.top || first.y > rect.bottom) return 0
    if (state.last && latest.x === state.last.x && latest.y === state.last.y) return 0

    // Mirror horizontal coordinates so the same aiming triangle works from either rail.
    const mirror = props.direction?.() === "left"
    const loc = { x: mirror ? -latest.x : latest.x, y: latest.y }
    const prev = { x: mirror ? -first.x : first.x, y: first.y }
    const boundary = mirror ? -rect.left : rect.right

    if (boundary - loc.x <= edge) {
      state.last = latest
      return delay
    }

    const upper = { x: boundary, y: rect.top - tolerance }
    const lower = { x: boundary, y: rect.bottom + tolerance }
    const slope = (a: Point, b: Point) => (b.y - a.y) / (b.x - a.x)

    const decreasing = slope(loc, upper)
    const increasing = slope(loc, lower)
    const prevDecreasing = slope(prev, upper)
    const prevIncreasing = slope(prev, lower)

    if (decreasing < prevDecreasing && increasing > prevIncreasing) {
      state.last = latest
      return delay
    }

    state.last = undefined
    return 0
  }

  const activate = (id: string) => {
    cancel()
    props.onActivate(id)
  }

  const request = (id: string) => {
    if (!id) return
    if (props.active() === id) return

    if (!props.active()) {
      activate(id)
      return
    }

    const ms = wait()
    if (ms === 0) {
      activate(id)
      return
    }

    cancel()
    state.pending = id
    state.timer = window.setTimeout(() => {
      state.timer = undefined
      if (state.pending !== id) return
      state.pending = undefined
      if (!props.enabled()) return
      if (!props.active()) return
      if (state.over !== id) return
      props.onActivate(id)
    }, ms)
  }

  const enter = (id: string, event: MouseEvent) => {
    if (!props.enabled()) return
    state.over = id
    move(event)
    request(id)
  }

  const leave = (id: string) => {
    if (state.over === id) state.over = undefined
    if (state.pending === id) cancel()
  }

  return { move, enter, leave, activate, request, cancel, reset }
}
