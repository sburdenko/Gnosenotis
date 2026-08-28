/**
 * Tree & graph traversal patterns — the family that shows up most often in
 * gameplay code (navmesh regions, dependency graphs, influence maps).
 */
import type { AlgoPattern } from "@/types/content";

export const graphPatterns: AlgoPattern[] = [
  {
    id: "tree-dfs",
    n: "Tree DFS (recursion with state)",
    nru: "DFS по дереву (рекурсия с состоянием)",
    idea: "Solve a node from the answers of its children (bottom-up) or hand each child the constraints it must respect (top-down) — the recursion carries the state either way.",
    idearu:
      "Считать ответ узла из ответов детей (снизу вверх) либо передавать каждому ребёнку ограничения, которые он обязан соблюдать (сверху вниз) — состояние едет вместе с рекурсией.",
    when: [
      "Depth, diameter, sums, validation of a tree property",
      '"Is this a valid BST" — bounds must flow down, not just values up',
      "Any transform / scene-graph walk in Unity",
    ],
    whenru: [
      "Глубина, диаметр, суммы, проверка свойства дерева",
      "«Корректен ли BST» — границы должны идти вниз, а не только значения наверх",
      "Любой обход графа трансформов или сцены в Unity",
    ],
    cx: "O(n) time / O(h) stack, h = height (n in the worst, degenerate case)",
    code: `// Bottom-up: children first, then combine.
int Depth(Node node) =>
    node == null ? 0 : 1 + Math.Max(Depth(node.Left), Depth(node.Right));

// Top-down: pass the allowed range down instead of comparing with the parent.
bool IsBst(Node node, long min, long max)
{
    if (node == null) return true;
    if (node.Value <= min || node.Value >= max) return false;
    return IsBst(node.Left, min, node.Value)
        && IsBst(node.Right, node.Value, max);
}`,
    traps: [
      "Validating a BST by comparing a node only with its parent — the constraint is a range, not one comparison",
      "Using `int.MinValue` as the initial bound when node values can be `int.MinValue`; widen to `long`",
      "Quoting O(log n) space for the stack — that only holds if the tree is balanced",
    ],
    trapsru: [
      "Проверять BST сравнением только с родителем — ограничение это диапазон, а не одно сравнение",
      "Брать `int.MinValue` начальной границей, когда значения узлов бывают `int.MinValue`; расширьте до `long`",
      "Называть O(log n) памяти на стек — это верно только для сбалансированного дерева",
    ],
  },
  {
    id: "tree-bfs",
    n: "Tree BFS (level order)",
    nru: "BFS по дереву (по уровням)",
    idea: "Process the tree one full level at a time by snapshotting the queue size before the loop — everything currently queued is exactly the current level.",
    idearu:
      "Обрабатывать дерево ровно по уровню за раз, зафиксировав размер очереди перед циклом, — всё, что сейчас в очереди, и есть текущий уровень.",
    when: [
      '"Level order", "right side view", "minimum depth", "per-level aggregate"',
      "The answer is shallowest-first, so DFS would explore too deep before finding it",
      "You need to avoid recursion depth on a degenerate tree",
    ],
    whenru: [
      "«По уровням», «вид справа», «минимальная глубина», «агрегат по уровню»",
      "Ответ ближе к корню, и DFS уйдёт вглубь раньше, чем его найдёт",
      "Нужно избежать глубокой рекурсии на вырожденном дереве",
    ],
    cx: "O(n) time / O(width) space",
    code: `var queue = new Queue<Node>();
if (root != null) queue.Enqueue(root);

while (queue.Count > 0)
{
    int levelSize = queue.Count;          // snapshot BEFORE draining
    for (int i = 0; i < levelSize; i++)
    {
        var node = queue.Dequeue();
        Visit(node);
        if (node.Left != null) queue.Enqueue(node.Left);
        if (node.Right != null) queue.Enqueue(node.Right);
    }
    depth++;
}`,
    traps: [
      "Looping `while (queue.Count > 0)` inside the level loop — level boundaries disappear",
      "Enqueueing null children and then dereferencing them",
      "Counting minimum depth at a node that still has one child — it must be a real leaf",
    ],
    trapsru: [
      "Цикл `while (queue.Count > 0)` внутри цикла по уровню — границы уровней исчезают",
      "Класть в очередь null-детей и потом их разыменовывать",
      "Считать минимальную глубину в узле, у которого ещё есть один ребёнок — нужен настоящий лист",
    ],
  },
  {
    id: "grid-flood",
    n: "Grid flood fill / connected components",
    nru: "Заливка сетки и компоненты связности",
    idea: "Treat each cell as a node with up to four neighbours, then run DFS or BFS from every unvisited start — each run marks exactly one connected region.",
    idearu:
      "Считать каждую клетку узлом с четырьмя соседями и запускать DFS или BFS из каждой непосещённой клетки — один запуск помечает ровно одну связную область.",
    when: [
      '"Number of islands / regions / groups" on a grid',
      "Paint bucket, terrain regions, room detection, chunk grouping",
      "Any adjacency you can express as a delta array",
    ],
    whenru: [
      "«Количество островов / регионов / групп» на сетке",
      "Заливка, регионы террейна, поиск комнат, группировка чанков",
      "Любое соседство, выразимое массивом смещений",
    ],
    cx: "O(rows × cols) time / O(rows × cols) worst-case space",
    code: `static readonly int[] Dr = { -1, 1, 0, 0 };
static readonly int[] Dc = { 0, 0, -1, 1 };

void Fill(int r, int c)                       // iterative: no stack overflow
{
    var stack = new Stack<(int r, int c)>();
    stack.Push((r, c));
    grid[r][c] = Visited;                     // mark on PUSH, not on pop

    while (stack.Count > 0)
    {
        var (cr, cc) = stack.Pop();
        for (int d = 0; d < 4; d++)
        {
            int nr = cr + Dr[d], nc = cc + Dc[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (grid[nr][nc] != Target) continue;
            grid[nr][nc] = Visited;
            stack.Push((nr, nc));
        }
    }
}`,
    traps: [
      "Marking visited on pop instead of push — the same cell gets queued many times and the complexity blows up",
      "Recursive DFS on a 1000×1000 grid — that is a stack overflow, not a style preference",
      "Forgetting that the fill is a no-op when the start cell already holds the target colour",
    ],
    trapsru: [
      "Помечать посещённым при снятии, а не при добавлении — клетка попадёт в стек многократно, сложность взлетает",
      "Рекурсивный DFS на сетке 1000×1000 — это переполнение стека, а не вопрос вкуса",
      "Забыть, что заливка бессмысленна, если стартовая клетка уже нужного цвета",
    ],
  },
  {
    id: "graph-traversal",
    n: "Graph traversal with a visited set",
    nru: "Обход графа с множеством посещённых",
    idea: "DFS or BFS over an arbitrary graph, where a visited set does double duty: it stops cycles, and it can store what you already built for each node.",
    idearu:
      "DFS или BFS по произвольному графу, где множество посещённых работает на две задачи: не даёт зациклиться и хранит то, что уже построено для каждого узла.",
    when: [
      "Reachability, deep copy, component labelling on a non-grid graph",
      "The edges are computed on demand rather than stored (an implicit graph)",
      "Cloning a prefab graph, a save structure, or a scene subtree",
    ],
    whenru: [
      "Достижимость, глубокая копия, разметка компонент на негридовом графе",
      "Рёбра вычисляются на лету, а не хранятся (неявный граф)",
      "Клонирование графа префаба, структуры сейва или поддерева сцены",
    ],
    cx: "O(V + E) time / O(V) space",
    code: `// Deep copy: the map is both "visited" and "what I already made for it".
var clones = new Dictionary<Node, Node>();

Node Clone(Node node)
{
    if (node == null) return null;
    if (clones.TryGetValue(node, out var existing)) return existing;

    var copy = new Node(node.Value);
    clones[node] = copy;                       // register BEFORE recursing,
    foreach (var neighbour in node.Neighbours) // or a cycle recurses forever
        copy.Neighbours.Add(Clone(neighbour));
    return copy;
}`,
    traps: [
      "Registering the clone after the recursive calls — a cycle then recurses until the stack dies",
      "A visited set of values rather than node identities, which merges distinct nodes that happen to be equal",
      "Recursion on a graph that can be tens of thousands of nodes deep; switch to an explicit stack",
    ],
    trapsru: [
      "Регистрировать клон после рекурсивных вызовов — на цикле рекурсия уйдёт до переполнения стека",
      "Множество посещённых по значениям, а не по идентичности узлов — сольёт разные, но равные узлы",
      "Рекурсия на графе глубиной в десятки тысяч узлов; переходите на явный стек",
    ],
  },
  {
    id: "bfs-shortest",
    n: "BFS for shortest path (unweighted)",
    nru: "BFS для кратчайшего пути (без весов)",
    idea: "On unweighted edges, the first time BFS reaches a node it has reached it by the fewest steps — seed the queue with every source at once for a multi-source wave, and put extra resources into the visited key for state-space search.",
    idearu:
      "На невзвешенных рёбрах BFS достигает узла впервые за минимальное число шагов — засеяв очередь сразу всеми источниками, получаем многоисточниковую волну, а добавив ресурсы в ключ посещённых — поиск по пространству состояний.",
    when: [
      "Fewest moves / minimum steps / shortest path with uniform cost",
      "Fire spread, infection, distance fields, influence maps (multi-source)",
      "Path with a budget: keys, fuel, k obstacle removals (state-space)",
    ],
    whenru: [
      "Минимум ходов / шагов / кратчайший путь при одинаковой цене",
      "Распространение огня, заражение, поля расстояний, карты влияния (много источников)",
      "Путь с бюджетом: ключи, топливо, k разрушаемых препятствий (пространство состояний)",
    ],
    cx: "O(V + E) time / O(V) space — multiplied by the size of the extra state",
    code: `// Multi-source: every source starts at distance 0, in the same queue.
var queue = new Queue<(int r, int c)>();
foreach (var src in sources) { dist[src.r][src.c] = 0; queue.Enqueue(src); }

// State-space: the visited key is (cell + remaining budget), not just the cell.
var seen = new HashSet<(int r, int c, int budget)>();
while (queue.Count > 0)
{
    var (r, c, budget) = queue.Dequeue();
    if (r == goalR && c == goalC) return steps;
    foreach (var (nr, nc) in Neighbours(r, c))
    {
        int next = budget - (IsObstacle(nr, nc) ? 1 : 0);
        if (next < 0 || !seen.Add((nr, nc, next))) continue;
        queue.Enqueue((nr, nc, next));
    }
}`,
    traps: [
      "Marking visited when dequeuing — with many sources the same node enters the queue repeatedly",
      "Using BFS on weighted edges: as soon as costs differ, it is Dijkstra",
      "Keying visited by cell only in a state-space search, which discards strictly better budgets",
    ],
    trapsru: [
      "Помечать посещённым при извлечении — при многих источниках узел попадёт в очередь многократно",
      "Использовать BFS на взвешенных рёбрах: как только цены различаются — это Дейкстра",
      "Ключевать посещённые только клеткой в поиске по состояниям, отбрасывая заведомо лучшие бюджеты",
    ],
  },
  {
    id: "dijkstra",
    n: "Dijkstra (weighted shortest path)",
    nru: "Дейкстра (кратчайший путь с весами)",
    idea: "Always expand the cheapest frontier node from a priority queue; when a node is popped its distance is final, because no cheaper route can still be waiting behind a more expensive one.",
    idearu:
      "Всегда разворачивать самый дешёвый узел фронта из приоритетной очереди; в момент извлечения расстояние окончательно — более дешёвого маршрута за более дорогим уже не осталось.",
    when: [
      "Edges have different non-negative costs: terrain, stamina, danger",
      "Minimax / bottleneck paths (swap the sum for a max in the relaxation)",
      "You are about to explain A* — this is the half of it that is not the heuristic",
    ],
    whenru: [
      "Рёбра имеют разную неотрицательную цену: террейн, выносливость, опасность",
      "Минимакс / bottleneck-пути (в релаксации сумма заменяется максимумом)",
      "Собираетесь объяснять A* — это его половина без эвристики",
    ],
    cx: "O(E log V) time / O(V) space",
    code: `var dist = new int[n]; Array.Fill(dist, int.MaxValue);
var pq = new PriorityQueue<int, int>();       // node, priority = distance
dist[source] = 0; pq.Enqueue(source, 0);

while (pq.TryDequeue(out int node, out int d))
{
    if (d > dist[node]) continue;             // stale duplicate entry
    foreach (var (next, weight) in graph[node])
    {
        int candidate = d + weight;           // bottleneck variant: Math.Max(d, weight)
        if (candidate >= dist[next]) continue;
        dist[next] = candidate;
        pq.Enqueue(next, candidate);
    }
}`,
    traps: [
      "Dijkstra with negative edges — it is simply wrong there; that is Bellman-Ford's job",
      "No stale check (`d > dist[node]`) when the queue has no decrease-key, so old entries re-expand nodes",
      "Claiming A* is faster in general — it is only faster with an admissible heuristic, and identical to Dijkstra when h = 0",
    ],
    trapsru: [
      "Дейкстра с отрицательными рёбрами — здесь она просто неверна; это работа Беллмана — Форда",
      "Нет проверки устаревших записей (`d > dist[node]`), когда в очереди нет decrease-key, — старые записи снова разворачивают узлы",
      "Утверждать, что A* быстрее вообще — он быстрее лишь с допустимой эвристикой и совпадает с Дейкстрой при h = 0",
    ],
  },
  {
    id: "topo-sort",
    n: "Topological sort",
    nru: "Топологическая сортировка",
    idea: "Repeatedly take a node whose remaining dependencies are zero (Kahn's algorithm); if fewer than n nodes come out, the leftovers form a cycle.",
    idearu:
      "Многократно брать узел, у которого не осталось зависимостей (алгоритм Кана); если вышло меньше n узлов, оставшиеся образуют цикл.",
    when: [
      "Build order, asset bundle dependencies, ability/tech trees, script execution order",
      '"Can all courses/tasks be finished?" — that question is cycle detection',
      "Any DAG that must be linearised",
    ],
    whenru: [
      "Порядок сборки, зависимости бандлов, деревья способностей и технологий, порядок выполнения скриптов",
      "«Можно ли пройти все курсы/задачи?» — это вопрос про поиск цикла",
      "Любой DAG, который нужно линеаризовать",
    ],
    cx: "O(V + E) time / O(V) space",
    code: `var indegree = new int[n];
foreach (var (from, to) in edges) indegree[to]++;

var queue = new Queue<int>();
for (int v = 0; v < n; v++) if (indegree[v] == 0) queue.Enqueue(v);

var order = new List<int>();
while (queue.Count > 0)
{
    int v = queue.Dequeue();
    order.Add(v);
    foreach (int next in graph[v])
        if (--indegree[next] == 0) queue.Enqueue(next);
}
return order.Count == n ? order : null;       // null == there is a cycle`,
    traps: [
      'Building the edges in the wrong direction — "a before b" and "a depends on b" are opposites',
      "Reporting success without the `order.Count == n` check, which is the only cycle detection here",
      "Expecting a unique answer: any valid order is correct unless the problem adds a tie-break rule",
    ],
    trapsru: [
      "Строить рёбра не в ту сторону — «a перед b» и «a зависит от b» противоположны",
      "Отчитаться об успехе без проверки `order.Count == n` — это единственный здесь поиск цикла",
      "Ждать единственного ответа: подходит любой корректный порядок, если в условии нет правила разрешения ничьих",
    ],
  },
  {
    id: "union-find",
    n: "Union-Find (disjoint set)",
    nru: "Система непересекающихся множеств (DSU)",
    idea: "Keep each group as a tree of parent pointers; `Find` walks to the root while flattening the path, and `Union` hangs the smaller root under the bigger.",
    idearu:
      "Хранить каждую группу деревом ссылок на родителя; `Find` идёт к корню, попутно сжимая путь, а `Union` подвешивает меньший корень под больший.",
    when: [
      "Connectivity that only ever grows — merges, never splits",
      '"Are these two in the same group?" asked many times',
      "Kruskal's MST, or offline connected components without a full traversal",
    ],
    whenru: [
      "Связность, которая только растёт: слияния без разделений",
      "Многократный вопрос «в одной ли они группе?»",
      "Краскал для MST или офлайн-компоненты связности без полного обхода",
    ],
    cx: "≈O(1) amortised per operation (inverse Ackermann) / O(n) space",
    code: `int[] parent, size;

int Find(int x)
{
    while (parent[x] != x)
    {
        parent[x] = parent[parent[x]];   // path halving
        x = parent[x];
    }
    return x;
}

bool Union(int a, int b)
{
    int ra = Find(a), rb = Find(b);
    if (ra == rb) return false;          // already together
    if (size[ra] < size[rb]) (ra, rb) = (rb, ra);
    parent[rb] = ra;
    size[ra] += size[rb];
    return true;
}`,
    traps: [
      "Union by writing `parent[a] = b` on the raw elements instead of on their roots",
      "Skipping union by size/rank and path compression, then still claiming near-constant time",
      "Reaching for DSU when the structure also needs deletions — it cannot split a set back apart",
    ],
    trapsru: [
      "Объединять записью `parent[a] = b` по самим элементам, а не по их корням",
      "Пропустить объединение по размеру/рангу и сжатие путей, но заявлять почти константное время",
      "Брать DSU там, где нужны и удаления — разделить множество обратно он не умеет",
    ],
  },
  {
    id: "backtracking",
    n: "Backtracking",
    nru: "Бэктрекинг",
    idea: "Choose, recurse, then undo the choice — the single path buffer is mutated on the way down and restored on the way up, so no copies are made per branch.",
    idearu:
      "Выбрать, углубиться, отменить выбор — один буфер пути изменяется на спуске и восстанавливается на подъёме, поэтому копии на каждую ветку не создаются.",
    when: [
      "Enumerate all subsets, permutations, combinations, placements",
      "Constraint search: sudoku, N-queens, word search on a grid",
      "Procedural placement or test-case generation with rules to satisfy",
    ],
    whenru: [
      "Перебор всех подмножеств, перестановок, сочетаний, расстановок",
      "Поиск с ограничениями: судоку, N ферзей, поиск слова на сетке",
      "Процедурная расстановка или генерация тест-кейсов с правилами",
    ],
    cx: "Exponential by nature — O(2^n) subsets, O(n!) permutations; pruning is what makes it usable",
    code: `void Backtrack(List<int> path, int start)
{
    results.Add(new List<int>(path));         // copy ONLY when recording
    for (int i = start; i < nums.Length; i++)
    {
        if (!IsPromising(nums[i])) continue;  // prune early — this is the whole game
        path.Add(nums[i]);
        Backtrack(path, i + 1);
        path.RemoveAt(path.Count - 1);        // undo, always
    }
}

// Grid search: mark the cell before recursing, restore it after.
grid[r][c] = Used;
foreach (var (nr, nc) in Neighbours(r, c)) Backtrack(nr, nc, index + 1);
grid[r][c] = original;`,
    traps: [
      "Storing a reference to the mutable path instead of a copy — every result ends up empty or identical",
      "Forgetting to restore state on the way up, which leaks a choice into sibling branches",
      "Not pruning: the difference between backtracking and brute force is the early exit",
    ],
    trapsru: [
      "Сохранять ссылку на изменяемый путь вместо копии — все результаты окажутся пустыми или одинаковыми",
      "Забыть восстановить состояние на подъёме — выбор протечёт в соседние ветки",
      "Не отсекать ветки: бэктрекинг отличается от полного перебора именно ранним выходом",
    ],
  },
];
