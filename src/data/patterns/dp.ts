/**
 * Dynamic-programming patterns — the three shapes that cover most interview
 * DP: linear state, grid state, and "fill a capacity" knapsack.
 */
import type { AlgoPattern } from "@/types/content";

export const dpPatterns: AlgoPattern[] = [
  {
    id: "dp-1d",
    n: "1-D DP (linear state)",
    nru: "Одномерный DP (линейное состояние)",
    idea: "Define dp[i] as the answer for the prefix ending at i, write the recurrence from a handful of earlier entries, then collapse the array to the few variables the recurrence actually reads.",
    idearu:
      "Определить dp[i] как ответ для префикса, заканчивающегося в i, выписать рекуррентность через несколько предыдущих значений и схлопнуть массив до тех переменных, которые она реально читает.",
    when: [
      '"How many ways", "maximum/minimum over a sequence", "can you reach the end"',
      "Each element's answer depends on a fixed number of earlier answers",
      "The naive recursion recomputes the same index over and over",
    ],
    whenru: [
      "«Сколько способов», «максимум/минимум по последовательности», «можно ли дойти до конца»",
      "Ответ для элемента зависит от фиксированного числа предыдущих ответов",
      "Наивная рекурсия пересчитывает один и тот же индекс снова и снова",
    ],
    cx: "O(n) time / O(1) space after the rolling-variable collapse",
    code: `// dp[i] = dp[i - 1] + dp[i - 2] needs only two variables, not an array.
int prev2 = 1, prev1 = 1;
for (int i = 2; i <= n; i++)
{
    int current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
}
return prev1;

// Steps to write it every time:
// 1. state:      what does dp[i] MEAN, in one sentence
// 2. recurrence: how does dp[i] follow from smaller i
// 3. base cases: the smallest i you can answer directly
// 4. order:      iterate so every dependency is already computed`,
    traps: [
      'Skipping step 1 — an unstated meaning for dp[i] is why the recurrence "almost works"',
      "Rolling variables updated in the wrong order, so `prev2` already holds the new value",
      "Base cases that are off by one (`n = 0`, `n = 1`) and silently break only the small inputs",
    ],
    trapsru: [
      "Пропустить шаг 1 — из-за несформулированного смысла dp[i] рекуррентность «почти работает»",
      "Обновлять бегущие переменные в неверном порядке, из-за чего `prev2` уже содержит новое значение",
      "Базовые случаи со сдвигом на единицу (`n = 0`, `n = 1`), ломающие только маленькие входы",
    ],
  },
  {
    id: "dp-grid",
    n: "Grid DP",
    nru: "DP на сетке",
    idea: "dp[r][c] is the answer for the sub-grid ending at that cell, built from the cells you are allowed to arrive from — usually the one above and the one to the left.",
    idearu:
      "dp[r][c] — ответ для подсетки, заканчивающейся в этой клетке; он строится из клеток, откуда разрешён приход, — обычно сверху и слева.",
    when: [
      "Paths through a grid, edit distance, longest common subsequence",
      "Movement is restricted to one direction (no back-tracking, no cycles)",
      "The grid has obstacles or per-cell costs",
    ],
    whenru: [
      "Пути по сетке, редакционное расстояние, наибольшая общая подпоследовательность",
      "Движение ограничено одним направлением (без возвратов и циклов)",
      "На сетке есть препятствия или цена за клетку",
    ],
    cx: "O(rows × cols) time / O(cols) space with a rolling row",
    code: `var dp = new int[cols];
dp[0] = 1;                                   // one way to stand on the start

for (int r = 0; r < rows; r++)
    for (int c = 0; c < cols; c++)
    {
        if (grid[r][c] == Obstacle) { dp[c] = 0; continue; }
        if (c > 0) dp[c] += dp[c - 1];       // dp[c] still holds the row above
    }
return dp[cols - 1];`,
    traps: [
      "Using grid DP where movement can go in all four directions — that is BFS/Dijkstra, not DP, because the dependencies form cycles",
      "Rolling one row but reading `dp[c]` after already overwriting it",
      "Not zeroing an obstacle cell, so paths leak straight through the wall",
    ],
    trapsru: [
      "Применять DP на сетке там, где движение возможно во все четыре стороны, — это BFS/Дейкстра, а не DP: зависимости образуют циклы",
      "Катить одну строку, но читать `dp[c]` уже после перезаписи",
      "Не обнулить клетку-препятствие — пути «протекут» сквозь стену",
    ],
  },
  {
    id: "dp-knapsack",
    n: "Knapsack DP (fill a capacity)",
    nru: "DP-рюкзак (заполнение вместимости)",
    idea: "dp[amount] is the best way to make exactly that amount; loop items outside and capacity inside, and the direction of the inner loop decides whether each item can be reused.",
    idearu:
      "dp[amount] — лучший способ набрать ровно эту сумму; внешний цикл по предметам, внутренний по вместимости, а направление внутреннего цикла решает, можно ли брать предмет повторно.",
    when: [
      "Crafting costs, loot budgets, upgrade paths, coin change, subset sum",
      '"Fewest items to reach exactly X" or "is X reachable at all"',
      "Each item may be taken once (0/1) or unlimited times (unbounded)",
    ],
    whenru: [
      "Стоимость крафта, бюджеты лута, ветки апгрейдов, размен монет, сумма подмножества",
      "«Минимум предметов, чтобы набрать ровно X» или «достижим ли X вообще»",
      "Предмет берётся один раз (0/1) или неограниченно (unbounded)",
    ],
    cx: "O(items × capacity) time / O(capacity) space",
    code: `var dp = new int[amount + 1];
Array.Fill(dp, Unreachable);
dp[0] = 0;

foreach (int coin in coins)
    for (int a = coin; a <= amount; a++)          // ASCENDING: reuse allowed
        if (dp[a - coin] != Unreachable)
            dp[a] = Math.Min(dp[a], dp[a - coin] + 1);

// 0/1 knapsack — each item once — is the SAME loop run downwards:
//     for (int a = amount; a >= weight; a--)
// so an item cannot be picked up again within its own pass.`,
    traps: [
      "Getting the inner loop direction backwards, which silently turns 0/1 into unbounded (or the reverse)",
      'Using 0 as the "unreachable" marker when 0 is a legitimate answer for amount 0',
      "Assuming greedy works because it does for real coins — it fails for 1/3/4 with target 6",
    ],
    trapsru: [
      "Перепутать направление внутреннего цикла — 0/1 незаметно превращается в unbounded (или наоборот)",
      "Использовать 0 как метку «недостижимо», когда 0 — корректный ответ для суммы 0",
      "Считать, что жадность работает, раз она работает на реальных монетах, — на 1/3/4 с целью 6 она ломается",
    ],
  },
];
