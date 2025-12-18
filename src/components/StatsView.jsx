// components/StatsView.jsx
import React from "react";

const StatsView = ({
  t,
  habits,
  completions,
  daysInMonth,
  getHabitStats,
  stats,
}) => {
  return (
    <div className="space-y-6 animate-fade-out">
      {/* Progress Chart */}
      <div className="bg-black/10 backdrop-blur-lg p-6 rounded-3xl">
        <h3 className="text-xl font-bold text-black mb-4">{t.progress}</h3>
        <div className="bg-black/10 w-full m-auto overflow-x-auto rounded-lg p-4">
          <svg viewBox="0 0 800 300" className="w-200 sm:w-full sm:h-90">
            <defs>
              <linearGradient
                className="fixed right-0 bottom-0"
                id="areaGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="50"
                y1={250 - y * 2}
                x2="750"
                y2={250 - y * 2}
                stroke="#d1d5db"
                strokeWidth="1"
                strokeDasharray="5,5"
                opacity="0.3"
              />
            ))}

            {(() => {
              const points = habits.map((habit, index) => {
                const habitStats = getHabitStats(habit.id);
                const x = 50 + index * (700 / (habits.length - 1 || 1));
                const y = 250 - habitStats.percentage * 2;
                return {
                  x,
                  y,
                  percentage: habitStats.percentage,
                  emoji: habit.emoji,
                  name: habit.name,
                };
              });

              const pathData =
                points
                  .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
                  .join(" ") +
                ` L ${points[points.length - 1].x},250 L 50,250 Z`;

              return (
                <>
                  <path d={pathData} fill="url(#areaGradient)" />
                  <path
                    d={points
                      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
                      .join(" ")}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                  />
                  {points.map((point, index) => (
                    <g key={index}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="6"
                        fill="#10b981"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={point.x}
                        y={point.y - 15}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="bold"
                        fill="#000"
                      >
                        {point.percentage}%
                      </text>
                      <text
                        x={point.x}
                        y="280"
                        textAnchor="middle"
                        fontSize="15"
                      >
                        {point.emoji}
                      </text>
                    </g>
                  ))}
                </>
              );
            })()}

            {[0, 25, 50, 75, 100].map((y) => (
              <text
                key={y}
                x="35"
                y={255 - y * 2}
                textAnchor="end"
                fontSize="12"
                fill="#666"
              >
                {y}%
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* Best Performing Habits */}
      <div className="bg-black/10 backdrop-blur-lg p-6 rounded-3xl">
        <h3 className="text-xl font-bold text-black mb-4">{t.rating}</h3>
        <div className="space-y-3">
          {habits
            .map((habit) => ({
              ...habit,
              stats: getHabitStats(habit.id),
            }))
            .sort((a, b) => b.stats.percentage - a.stats.percentage)
            .slice(0, 3)
            .map((habit, index) => (
              <div
                key={habit.id}
                className="flex items-center gap-4 bg-black/10 rounded-lg p-4"
              >
                <span className="text-3xl font-bold text-black">
                  #{index + 1}
                </span>
                <span className="text-3xl">{habit.emoji}</span>
                <div className="flex-1">
                  <h4 className="text-black font-semibold">{habit.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-white/20 rounded-full h-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          habit.stats.percentage >= 70
                            ? "bg-green-500"
                            : habit.stats.percentage >= 40
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${habit.stats.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-black">
                      {habit.stats.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Daily Completion Rate */}
      <div className="bg-black/10 backdrop-blur-lg p-6 rounded-3xl">
        <h3 className="text-xl font-bold text-black mb-4">{t.harakat}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, weekIndex) => {
            const weekStart = weekIndex * 7 + 1;
            const weekEnd = Math.min(weekStart + 6, daysInMonth);
            let weekCompleted = 0;
            let weekTotal = 0;

            for (let day = weekStart; day <= weekEnd; day++) {
              habits.forEach((habit) => {
                const key = `${habit.id}-${day}`;
                weekTotal++;
                if (completions[key]) weekCompleted++;
              });
            }

            const weekPercentage =
              weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

            return (
              <div key={weekIndex} className="bg-black/10 rounded-lg p-4">
                <div className="text-center mb-3">
                  <h4 className="text-lg font-bold text-black">
                    {weekIndex + 1}
                    {t.weeks}
                  </h4>
                  <p className="text-xs text-gray-700">
                    {weekStart}-{weekEnd} {t.days}
                  </p>
                </div>
                <div className="flex items-center justify-center mb-3">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke={
                          weekPercentage >= 70
                            ? "#10b981"
                            : weekPercentage >= 40
                            ? "#eab308"
                            : "#ef4444"
                        }
                        strokeWidth="12"
                        strokeDasharray={`${
                          (weekPercentage / 100) * 351.86
                        } 351.86`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-black">
                        {weekPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-700">
                    {weekCompleted} / {weekTotal} {t.bajarilgan}
                  </p>
                  <h3 className="text-lg font-bold text-black my-4">
                    {t.kunlar}
                  </h3>
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1">
                  {Array.from(
                    { length: weekEnd - weekStart + 1 },
                    (_, dayIndex) => {
                      const day = weekStart + dayIndex;
                      let dayCompleted = 0;
                      habits.forEach((habit) => {
                        const key = `${habit.id}-${day}`;
                        if (completions[key]) dayCompleted++;
                      });
                      const dayPercentage =
                        habits.length > 0
                          ? Math.round((dayCompleted / habits.length) * 100)
                          : 0;

                      return (
                        <div
                          key={day}
                          className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                            dayPercentage >= 70
                              ? "bg-green-500 text-black"
                              : dayPercentage >= 40
                              ? "bg-yellow-500 text-black"
                              : dayPercentage === 0
                              ? "bg-gray-300 text-gray-600"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {day}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Summary */}
      {/* Weekly Summary */}
      <div className="bg-black/10 backdrop-blur-lg p-6 rounded-3xl">
        <h3 className="text-xl font-bold text-black mb-4">{t.xulosa}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-black">{stats.total}</div>
            <div className="text-sm text-gray-700">{t.vazifa}</div>
          </div>
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-2xl font-bold text-black">
              {stats.completed}
            </div>
            <div className="text-sm text-gray-700">{t.bajarilgan}</div>
          </div>
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
            <div className="text-2xl mb-2">❌</div>
            <div className="text-2xl font-bold text-black">
              {stats.total - stats.completed}
            </div>
            <div className="text-sm text-gray-700">{t.bajarilmagan}</div>
          </div>
        </div>
      </div>

      {/* Habit Details */}
      <div className="bg-black/10 backdrop-blur-lg p-6 rounded-3xl">
        <h3 className="text-xl font-bold text-black mb-4">{t.xulosa}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => {
            const habitStats = getHabitStats(habit.id);
            return (
              <div
                key={habit.id}
                className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-gray-400"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{habit.emoji}</span>
                  <div className="flex-1">
                    <h3 className="text-black font-semibold">{habit.name}</h3>
                    <p className="text-gray-700 text-sm">
                      {habitStats.completed} / {habitStats.total}
                      {t.kun}
                    </p>
                  </div>
                  <div className="text-xl font-bold text-black">
                    {habitStats.percentage}%
                  </div>
                </div>
                <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      habitStats.percentage >= 70
                        ? "bg-green-500"
                        : habitStats.percentage >= 40
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${habitStats.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsView;
