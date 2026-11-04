export type ThreadVariant = 'page' | 'introduction' | 'entry'

function workCurve(
  w: number,
  h: number,
  workBottom: number,
  offset: number,
  incomingHeight = offset,
) {
  const y = Math.min(h * 0.78, Math.max(h * 0.3, workBottom))
  const Y = (value: number) => offset + value
  // This is a continuation of the previous endpoint: no new M command.
  return `C${w * (w <= 760 ? 0.96 : 0.98)} ${Y(incomingHeight * 0.14)} ${w * 0.94} ${Y(y * 0.26)} ${w * 0.96} ${Y(y * 0.48)} C${w * 0.98} ${Y(y * 0.7)} ${w * 0.96} ${Y(y * 0.87)} ${w * 0.88} ${Y(y)} C${w * 0.8} ${Y(y * 1.13)} ${w * 0.45} ${Y(y - 50)} ${w * 0.55} ${Y(y - 95)} C${w * 0.65} ${Y(y - 140)} ${w * 0.8} ${Y(y + 110)} ${w * 0.57} ${Y(y + 150)} C${w * 0.34} ${Y(y + 190)} ${w * 0.06} ${Y(h * 0.82)} ${w * 0.06} ${Y(h * 0.9)} C${w * 0.06} ${Y(h * 0.98)} ${w * 0.13} ${Y(h * 0.98)} ${w * 0.15} ${Y(h)}`
}

// A single original path continues through the real introduction and work
// geometry, so later portions cannot begin drawing before earlier ones finish.
function entryCurve(w: number, h: number, offset: number, incomingHeight = h) {
  const Y = (value: number) => offset + value
  return `C${w * 0.19} ${Y(incomingHeight * 0.04)} ${w * 0.12} ${Y(h * 0.22)} ${w * 0.32} ${Y(h * 0.32)} C${w * 0.52} ${Y(h * 0.42)} ${w * 0.56} ${Y(h * 0.43)} ${w * 0.7} ${Y(h * 0.5)} C${w * 0.84} ${Y(h * 0.57)} ${w * 0.84} ${Y(h * 0.67)} ${w * 0.88} ${Y(h * 0.76)}`
}
export function threadPath(
  variant: ThreadVariant,
  width: number,
  height: number,
  workBottom = height * 0.55,
  introHeight = height * 0.4,
  sceneTop = height,
  previewHeight = 0,
): string {
  const w = Math.max(1, width),
    h = Math.max(1, height)
  if (variant === 'page') {
    const split = Math.max(1, Math.min(h - 1, introHeight))
    return (
      threadPath('introduction', w, split) +
      ' ' +
      workCurve(w, Math.max(1, sceneTop - split), workBottom - split, split) +
      (previewHeight
        ? ' ' +
          entryCurve(w, previewHeight, sceneTop, Math.max(1, sceneTop - split))
        : '')
    )
  }
  if (variant === 'introduction') {
    if (w <= 760)
      return `M-30 ${h * 0.12} C${w * 0.05} ${h * 0.12} ${w * 0.04} ${h * 0.27} ${w * 0.045} ${h * 0.44} C${w * 0.05} ${h * 0.61} ${w * 0.3} ${h * 0.86} ${w * 0.42} ${h * 0.72} C${w * 0.54} ${h * 0.58} ${w * 0.33} ${h * 0.59} ${w * 0.32} ${h * 0.74} C${w * 0.31} ${h * 0.89} ${w * 0.78} ${h * 0.93} ${w * 0.84} ${h}`
    return `M-70 ${h * 0.12} C${w * 0.02} ${h * 0.12} ${w * 0.045} ${h * 0.25} ${w * 0.045} ${h * 0.42} C${w * 0.045} ${h * 0.59} ${w * 0.23} ${h * 0.84} ${w * 0.33} ${h * 0.7} C${w * 0.43} ${h * 0.56} ${w * 0.28} ${h * 0.53} ${w * 0.26} ${h * 0.67} C${w * 0.24} ${h * 0.81} ${w * 0.77} ${h * 0.93} ${w * 0.84} ${h}`
  }
  return `M${w * 0.15} 0 ` + entryCurve(w, h, 0)
}

// One stroke, including a hidden continuation behind the pinned process view.
// Its measured waypoints let the orb arrive before expansion and resume at Work.
export function storyThreadPath(
  width: number,
  introHeight: number,
  processTop: number,
  processBottom: number,
  closingTop: number,
  workBottom: number,
  viewport: number,
) {
  const w = Math.max(1, width),
    h = Math.max(1, introHeight),
    v = Math.max(1, viewport)
  const intro = `M${w * 0.76} 0 C${w * 0.76} ${h * 0.16} ${w * 0.08} ${h * 0.14} ${w * 0.08} ${h * 0.37} C${w * 0.08} ${h * 0.6} ${w * 0.9} ${h * 0.49} ${w * 0.9} ${h * 0.72} C${w * 0.9} ${h * 0.95} ${w * 0.77} ${h * 0.93} ${w * 0.84} ${h}`
  const Y = (y: number) => processTop + y
  const before =
    intro +
    ` C${w * 0.98} ${Y(h * 0.14)} ${w * 0.94} ${Y(v * 0.34)} ${w * 0.88} ${Y(v * 0.5)} C${w * 0.82} ${Y(v * 0.66)} ${w * 0.88} ${Y(v * 0.68)} ${w * 0.88} ${Y(v * 0.76)}`
  const through =
    before +
    ` C${w * 0.88} ${Y(v * 0.84)} ${w * 0.71} ${processBottom - v * 0.4 - h * 0.07} ${w * 0.78} ${processBottom - v * 0.4}`
  const workHeight = Math.max(1, closingTop - processBottom)
  const path =
    through +
    ` C${w * 0.85} ${processBottom - v * 0.4 + h * 0.07} ${w * (w <= 760 ? 0.78 : 0.77)} ${processBottom - h * 0.07} ${w * 0.84} ${processBottom}` +
    ' ' +
    workCurve(w, workHeight, workBottom - processBottom, processBottom, h) +
    ' ' +
    entryCurve(w, v, closingTop, workHeight)
  return { before, through, path }
}

export function storyDrawProgress(
  scroll: number,
  start: number,
  processStart: number,
  processEnd: number,
  end: number,
  arrival: number,
  departure: number,
) {
  const clamp = (v: number) => Math.max(0, Math.min(1, v))
  if (scroll < processStart)
    return arrival * clamp((scroll - start) / Math.max(1, processStart - start))
  if (scroll < processEnd)
    return (
      arrival +
      (departure - arrival) *
        // Hold the head at the window until the blue wave covers the line.
        clamp(
          ((scroll - processStart) / Math.max(1, processEnd - processStart) -
            0.085) /
            0.915,
        )
    )
  return (
    departure +
    (1 - departure) *
      clamp((scroll - processEnd) / Math.max(1, end - processEnd))
  )
}
