/**
 * Curated "Reading list" links, grouped by topic. Extracted verbatim from
 * the legacy HTML app.
 */
import type { ResourceGroup } from "@/types/content";

export const resourceGroups: ResourceGroup[] = 
[
{g:"Engine internals & official depth",gru:"Внутренности движка и официальная глубина",items:[
 {t:"Unity Manual — Best Practice Guides",u:"https://docs.unity3d.com/Manual/BestPracticeGuides.html",b:["must","free"],
  d:"Understanding optimization, memory management and asset workflow, written by the engine team. Most people never finish it — interviewers quote from it.",
  dru:"Оптимизация, управление памятью и работа с ассетами от команды движка. Мало кто дочитывает, а на собесе спрашивают именно отсюда."},
 {t:"Unity free e-books (profiling, mobile perf, design patterns)",u:"https://unity.com/resources",b:["must","free"],
  d:"The Ultimate Guide to Profiling, Optimize your mobile game performance, Level up your code with design patterns — essentially prepared answers to most performance questions.",
  dru:"«Ultimate guide to profiling», «Optimize your mobile game performance», «Level up your code with design patterns» — по сути готовые ответы на большинство перф-вопросов."},
 {t:"aras-p.info — Aras Pranckevičius",u:"https://aras-p.info/",b:["must"],
  d:"Former Unity graphics lead. Engine internals, shader compilation, build times, low-level performance. Worth reading the archive front to back.",
  dru:"Бывший ведущий графики Unity: внутрянка движка, компиляция шейдеров, время сборки, низкоуровневый перф. Архив стоит читать целиком."},
 {t:"Unity Blog — engineering posts",u:"https://unity.com/blog",b:["free"],
  d:"Filter to the technical posts (rendering, DOTS, memory, Unity 6 pipeline work); skip the marketing.",
  dru:"Фильтровать по техническим постам (рендер, DOTS, память, работа над пайплайном Unity 6), остальное — маркетинг."},
 {t:"Unity Discussions — beta & DOTS sections",u:"https://discussions.unity.com/",b:[],
  d:"Where Unity engineers answer directly. Often the only source on undocumented behaviour and upcoming changes.",
  dru:"Здесь инженеры Unity отвечают напрямую. Часто единственный источник по недокументированному поведению и грядущим изменениям."}
]},
{g:"Graphics & shaders",gru:"Графика и шейдеры",items:[
 {t:"Catlike Coding",u:"https://catlikecoding.com/unity/tutorials/",b:["must","free"],
  d:"Jasper Flick. The only place that builds a custom SRP from scratch step by step. A course at mid-to-senior level, not a tutorial.",
  dru:"Jasper Flick. Единственный ресурс, где кастомный SRP пишут с нуля шаг за шагом. Это курс уровня мидл-сеньор, а не туториал."},
 {t:"Ben Golus — Medium",u:"https://bgolus.medium.com/",b:["must","free"],
  d:"Legendary long-reads on anti-aliased alpha test, normals, MSAA, stylised rendering. Hardware-level understanding.",
  dru:"Легендарные лонгриды про anti-aliased alpha test, нормали, MSAA, стилизованный рендер. Уровень понимания «что происходит в железе»."},
 {t:"Graphics Programming Weekly — Jendrik Illner",u:"https://www.jendrikillner.com/tags/weekly/",b:["must","free"],
  d:"Weekly digest of graphics research and engine work across the whole industry (issue 448 as of July 2026). Subscribe and skim once a week to stay current.",
  dru:"Еженедельный дайджест графических исследований и движковых статей по всей индустрии (выпуск 448 на июль 2026). Подписаться и скроллить раз в неделю."},
 {t:"Ronja's Shader Tutorials",u:"https://www.ronja-tutorials.com/",b:["free"],
  d:"Clean, precise HLSL-in-Unity reference. Ideal for the mode of I knew this, I just need the semantics again.",
  dru:"Аккуратный и точный справочник по HLSL в Unity. Идеально для режима «знал, но забыл семантику»."},
 {t:"Alan Zucconi",u:"https://www.alanzucconi.com/",b:["free"],
  d:"The maths behind shader effects, explained better than anywhere else.",
  dru:"Математика шейдерных эффектов, объяснено лучше, чем где-либо."},
 {t:"The Book of Shaders",u:"https://thebookofshaders.com/",b:["free"],
  d:"Engine-agnostic fragment shader fundamentals — useful to rebuild intuition about the fragment stage quickly.",
  dru:"Основы фрагментных шейдеров вне привязки к движку — быстро восстанавливает интуицию по фрагментной стадии."}
]},
{g:"Performance, memory, profiling",gru:"Производительность, память, профилирование",items:[
 {t:"The Gamedev Guru — Ruben Torres",u:"https://thegamedev.guru/",b:["must"],
  d:"An entire blog about Unity performance only: Addressables, memory, profiler workflows, mobile. The most directly applicable resource for optimisation interviews.",
  dru:"Целый блог только про производительность Unity: Addressables, память, работа с профайлером, мобилки. Самый прикладной ресурс под собес по оптимизации."},
 {t:"Unity Learn — profiling & memory modules",u:"https://learn.unity.com/",b:["free"],
  d:"Memory Profiler and Profile Analyzer walkthroughs with real captures — the tooling half of every perf answer.",
  dru:"Разборы Memory Profiler и Profile Analyzer на реальных захватах — инструментальная половина любого ответа про перф."},
 {t:"Unite talks on YouTube",u:"https://www.youtube.com/@unity",b:["free"],
  d:"Optimisation postmortems from shipped titles. Interviewers love how would you diagnose questions, and shipped-project answers land hardest.",
  dru:"Постмортемы оптимизации выпущенных игр. На собесах любят вопросы «как бы вы диагностировали», и ответы из реальных проектов звучат сильнее всего."},
 {t:"GDC Vault",u:"https://gdcvault.com/",b:[],
  d:"Deep technical talks, many free. Search by system (animation, streaming, netcode) rather than by studio.",
  dru:"Глубокие технические доклады, многие бесплатны. Искать лучше по системе (анимация, стриминг, неткод), а не по студии."}
]},
{g:"Architecture & craft",gru:"Архитектура и ремесло",items:[
 {t:"Game Programming Patterns — Robert Nystrom",u:"https://gameprogrammingpatterns.com/",b:["must","free"],
  d:"Free online. The vocabulary for architecture questions: update manager, object pool, component model, event queue, service locator.",
  dru:"Бесплатно онлайн. Словарь для вопросов по архитектуре: update-менеджер, пул объектов, компонентная модель, очередь событий, service locator."},
 {t:"Gaffer On Games — Glenn Fiedler",u:"https://gafferongames.com/",b:["must","free"],
  d:"Canonical articles on fixed timestep, prediction, snapshot interpolation. If netcode comes up, this is the language to answer in.",
  dru:"Каноничные статьи про фиксированный шаг, предсказание, интерполяцию снапшотов. Если спросят про неткод — отвечать надо этим языком."},
 {t:"Real-Time Rendering (book + resource portal)",u:"https://www.realtimerendering.com/",b:[],
  d:"The reference you keep returning to for years; the site also curates free graphics resources and papers.",
  dru:"Справочник, к которому возвращаются годами; на сайте также собраны бесплатные графические материалы и статьи."},
 {t:"Refactoring Guru — patterns & refactoring",u:"https://refactoring.guru/",b:["free"],
  d:"Fast refresher on classic patterns before a design round — pair it with the Unity-specific caveats from the questions tab.",
  dru:"Быстро освежить классические паттерны перед дизайн-секцией — вместе с оговорками про Unity из вкладки с вопросами."}
]},
{g:"Staying current",gru:"Быть в теме постоянно",items:[
 {t:"Graphics Programming Discord",u:"https://discord.gg/graphicsprogramming",b:[],
  d:"Where practitioners discuss techniques a year before they reach blogs. High signal, low noise.",
  dru:"Здесь практики обсуждают техники за год до того, как они доходят до блогов. Высокий сигнал, мало шума."},
 {t:"Unity Roadmap",u:"https://unity.com/roadmap/unity-platform",b:["free"],
  d:"Know what is landing next in rendering, DOTS and tooling — useful for the what would you use going forward part of an interview.",
  dru:"Понимать, что выходит дальше в рендере, DOTS и инструментах — пригодится для вопроса «что бы вы выбрали сейчас»."},
 {t:"r/gamedev & r/Unity3D",u:"https://www.reddit.com/r/gamedev/",b:[],
  d:"Noisy, but good for market signal: what studios are hiring for, which pipelines teams actually ship on.",
  dru:"Шумно, но полезно как рыночный сигнал: под что нанимают студии и на каких пайплайнах реально релизят."}
]}];
