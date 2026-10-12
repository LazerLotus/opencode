import { For, createMemo } from "solid-js"
import { useLanguage } from "@/context/language"
import { useSettings } from "@/context/settings"
import { resolveWorldDesign, worldDesigns } from "./world-design"
import { WorldArt } from "./world-art"
import "./worlds.css"

export function WorldHeader() {
  const settings = useSettings()
  const language = useLanguage()
  const design = createMemo(() => resolveWorldDesign(settings.appearance.design()))

  return (
    <header class="world-header" data-design={design().id}>
      <div class="world-brand">
        <img src="/assets/acceler-mark.png" alt="AccelerAI" width="36" height="36" />
        <span>
          AccelerAI<span class="world-brand-caption">Workspace</span>
        </span>
      </div>
      <div class="world-heading">
        <span class="world-kicker">{design().name} / Coding workspace</span>
        <h1>{design().line}</h1>
      </div>
      <WorldArt design={design().id} />
      <label class="world-design-picker">
        <span>{language.t("settings.general.row.design.title")}</span>
        <select
          data-action="world-design"
          value={design().id}
          onChange={(event) => settings.appearance.setDesign(resolveWorldDesign(event.currentTarget.value).id)}
        >
          <For each={worldDesigns}>{(item) => <option value={item.id}>{item.name}</option>}</For>
        </select>
      </label>
    </header>
  )
}
