import { expect, test } from "bun:test"
import { createAim } from "./aim"

test("delays switching projects while moving into a left-opening sidebar", async () => {
  const element = document.createElement("div")
  // Happy DOM has no layout engine; the rest of the hover controller is real.
  element.getBoundingClientRect = () => new DOMRect(0, 0, 64, 200)
  const selected: string[] = []
  const aim = createAim({
    enabled: () => true,
    active: () => "current",
    el: () => element,
    direction: () => "left",
    onActivate: (id) => selected.push(id),
    delay: 20,
  })
  aim.move(new MouseEvent("mousemove", { clientX: 40, clientY: 50 }))
  aim.enter("next", new MouseEvent("mouseenter", { clientX: 5, clientY: 80 }))
  expect(selected).toEqual([])
  await Bun.sleep(35)
  expect(selected).toEqual(["next"])
  aim.reset()
})
