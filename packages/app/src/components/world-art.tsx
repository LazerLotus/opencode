import { Match, Switch } from "solid-js"
import { WorldDesign } from "./world-design"

export function WorldArt(props: { design: WorldDesign }) {
  return (
    <svg class="world-art" viewBox="0 0 360 160" fill="none" aria-hidden="true">
      <Switch>
        <Match when={props.design === "kinetic"}>
          <ellipse cx="185" cy="80" rx="132" ry="48" stroke="currentColor" />
          <ellipse cx="185" cy="80" rx="85" ry="72" stroke="currentColor" transform="rotate(-20 185 80)" />
          <circle cx="185" cy="80" r="29" class="world-art-yellow" />
          <circle cx="68" cy="58" r="9" class="world-art-green" />
          <circle cx="292" cy="108" r="6" fill="currentColor" />
          <path d="M185 0v33M185 128v32M30 80h85M254 80h80" stroke="currentColor" stroke-dasharray="3 7" />
        </Match>
        <Match when={props.design === "symbiont"}>
          <path
            d="M177 160V60M177 111C131 111 94 72 91 31C140 34 177 60 177 111ZM177 83C224 83 260 50 261 12C215 15 178 36 177 83Z"
            stroke="currentColor"
            stroke-width="2"
          />
          <path d="M177 143C221 143 281 112 291 76C240 78 194 104 177 143Z" class="world-art-green" />
          <circle cx="97" cy="30" r="9" class="world-art-yellow" />
          <path d="M87 151C123 138 144 123 177 111" stroke="currentColor" />
        </Match>
        <Match when={props.design === "parallax"}>
          <path d="M0 150L153 28L360 150M0 115L153 28L360 112M0 79L153 28L360 74" stroke="currentColor" />
          <path d="M153 28L65 160M153 28L180 160M153 28L294 160" stroke="currentColor" />
          <circle cx="153" cy="28" r="18" class="world-art-yellow" />
          <path d="M209 0L286 160h74V0Z" fill="currentColor" opacity=".12" />
          <path d="M0 124h360" stroke="currentColor" stroke-width="3" />
        </Match>
        <Match when={props.design === "chorus"}>
          <path d="M0 35h360M0 58h360M0 81h360M0 104h360M0 127h360" stroke="currentColor" opacity=".6" />
          <path d="M34 35h61v23H34zM147 81h90v23h-90zM283 104h46v23h-46z" class="world-art-green" />
          <path d="M104 58h47v23h-47zM240 35h64v23h-64z" class="world-art-yellow" />
          <path d="M178 12v136" stroke="currentColor" stroke-width="3" />
          <circle cx="178" cy="13" r="6" fill="currentColor" />
        </Match>
        <Match when={props.design === "broodmind"}>
          <path
            d="M57 82C26 14 147-7 181 27C232-17 350 39 305 100C333 166 220 168 187 137C140 180 32 147 57 82Z"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M92 87C69 39 148 21 181 57C231 25 289 63 265 99C229 142 206 108 178 110C145 141 96 124 92 87Z"
            stroke="currentColor"
          />
          <path d="M115 75l63 12 54-25M178 87l18 41" stroke="currentColor" />
          <circle cx="178" cy="87" r="19" class="world-art-yellow" />
          <circle cx="115" cy="75" r="8" class="world-art-green" />
          <circle cx="232" cy="62" r="10" class="world-art-green" />
        </Match>
        <Match when={props.design === "quanta"}>
          <path
            d="M40 32h32v32H40zM72 64h32v32H72zM104 96h32v32h-32zM232 32h32v32h-32zM264 64h32v32h-32zM296 96h32v32h-32z"
            fill="currentColor"
            opacity=".5"
          />
          <path d="M136 32h64v32h32v64h-32v32h-64v-32h-32V64h32z" class="world-art-yellow" />
          <path d="M144 72h48v48h-48z" class="world-art-green" />
          <path d="M0 16h360M0 144h360" stroke="currentColor" stroke-dasharray="4 12" />
        </Match>
        <Match when={props.design === "raidweaver"}>
          <path d="M180 8l122 36v64l-122 44-122-44V44zM180 8v144M58 44l244 64M302 44L58 108" stroke="currentColor" />
          <path d="M180 46l35 13v41l-35 18-35-18V59z" class="world-art-yellow" />
          <path d="M180 59v45M167 78h26" stroke="#155EF2" stroke-width="3" />
          <path d="M18 54v52M342 54v52M8 64h20M332 96h20" stroke="currentColor" />
          <circle cx="74" cy="95" r="7" class="world-art-green" />
          <circle cx="290" cy="56" r="7" class="world-art-green" />
        </Match>
        <Match when={props.design === "nightwatch"}>
          <circle cx="188" cy="80" r="70" stroke="currentColor" />
          <circle cx="188" cy="80" r="45" stroke="currentColor" />
          <circle cx="188" cy="80" r="20" stroke="currentColor" />
          <path d="M188 10v140M118 80h140" stroke="currentColor" />
          <path d="M188 80l49-49a70 70 0 0 1 21 49Z" class="world-art-green" opacity=".65" />
          <circle cx="216" cy="56" r="6" class="world-art-yellow" />
          <circle cx="159" cy="106" r="4" class="world-art-green" />
          <path d="M47 25h42M47 35h25M283 126h42M299 136h26" stroke="currentColor" />
        </Match>
        <Match when={props.design === "commonplace"}>
          <path d="M82 20h95v120H82zM183 20h95v120h-95z" stroke="currentColor" />
          <path
            d="M98 44h61M98 58h48M98 89h61M98 103h61M199 44h63M199 58h63M199 72h47M199 114h63"
            stroke="currentColor"
          />
          <path d="M224 20h18v64l-9-8-9 8z" class="world-art-yellow" />
          <path d="M55 150h250" stroke="currentColor" />
          <circle cx="112" cy="126" r="5" class="world-art-green" />
        </Match>
        <Match when={props.design === "switchyard"}>
          <path
            d="M0 37h360M0 122h360M0 48h360M0 111h360M91 37l76 85M183 37l76 85"
            stroke="currentColor"
            stroke-width="2"
          />
          <path d="M27 55h92v49H27zM225 55h106v49H225z" class="world-art-green" />
          <path d="M135 55h73v49h-73z" class="world-art-yellow" />
          <path d="M36 62h24M36 96h24M233 62h24M233 96h24" stroke="#155EF2" stroke-width="2" />
        </Match>
        <Match when={props.design === "orchard"}>
          <ellipse cx="180" cy="128" rx="139" ry="22" stroke="currentColor" />
          <path d="M40 125C34 69 97 73 111 91C141 40 202 47 221 82C269 48 329 93 317 125Z" class="world-art-green" />
          <circle cx="182" cy="41" r="25" class="world-art-yellow" />
          <path d="M106 125V92M223 126V82M163 123v-19" stroke="#155EF2" stroke-width="2" />
          <path d="M25 46h55M273 31h55" stroke="currentColor" stroke-linecap="round" />
        </Match>
      </Switch>
    </svg>
  )
}
