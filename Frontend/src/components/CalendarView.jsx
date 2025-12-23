// components/CalendarView.jsx
import React from "react";
import { Plus, X, Check, Trash } from "lucide-react";

const CalendarView = ({
  t,
  habits,
  completions,
  daysInMonth,
  showAddHabit,
  setShowAddHabit,
  newHabitName,
  setNewHabitName,
  onAddHabit,
  onDeleteHabit,
  onToggleHabit,
  getHabitStats,
  saving,
}) => {
  return (
    <div className="bg-black/10 backdrop-blur-lg -z-1 p-6 border border-white/5 rounded-3xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-black">
          {t.myHabits}
        </h2>
        <button
          onClick={() => setShowAddHabit(true)}
          className="bg-white text-black px-4 hover:scale-110 active:scale-100 py-2 rounded-lg flex items-center gap-2 transition"
          disabled={saving}
        >
          <Plus className="w-5 h-5" />
          <p className="hidden sm:block">{t.addHabit}</p>
        </button>
      </div>

      {showAddHabit && (
        <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
          <div className="sm:flex items-center gap-2">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && onAddHabit()}
              placeholder={t.newHabitPlaceholder}
              className="flex-1 bg-white/10 text-black px-4 py-2 rounded-lg border w-full border-black/20 focus:outline-none focus:border-black"
              disabled={saving}
            />
            <div className="flex gap-2 my-4 items-center justify-between">
              <button
                onClick={onAddHabit}
                className="bg-green-500 hover:scale-110 active:scale-100 hover:bg-green-600 text-black px-4 py-2 rounded-lg transition disabled:opacity-50"
                disabled={saving}
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setShowAddHabit(false);
                  setNewHabitName("");
                }}
                className="bg-red-500 hover:scale-110 active:scale-100 hover:bg-red-600 text-black px-4 py-2 rounded-lg transition"
                disabled={saving}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-scroll">
        <table className="w-full">
          <thead className="border-y border-r border-gray-500">
            <tr>
              <th className="text-center font-semibold p-2 sticky left-0 bg-gray-500 text-white backdrop-blur">
                {t.habit}
              </th>

              {Array.from({ length: daysInMonth }, (_, i) => {
                const dayNumber = i + 1;
                return (
                  <th
                    key={i}
                    className="text-center border border-gray-500 p-2"
                  >
                    <div className="text-black w-13 text-xs font-semibold">
                      {dayNumber} {t.days}
                    </div>
                  </th>
                );
              })}

              <th className="text-center text-black text-xs p-2">%</th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => {
              const habitStats = getHabitStats(habit.id);
              return (
                <tr
                  key={habit.id}
                  className="border-y border-r rounded-2xl border-gray-500"
                >
                  <td className="px-2 z-1 font-bold sticky left-0 text-center bg-green-300 backdrop-blur">
                    <div className="flex items-center justify-between sm:w-50 md:w-70 group">
                      <span className="text-xl text-center">{habit.emoji}</span>
                      <span className="text-black text-center text-sm">
                        {habit.name}
                      </span>

                      <div className="lg:opacity-0 lg:group-hover:opacity-100 tranisition-all">
                        <button
                          onClick={() => onDeleteHabit(habit.id)}
                          className="group-hover:opacity-100 text-red-600 tranisition-all hover:scale-110 active:scale-100"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const key = `${habit.id}-${day}`;
                    const isCompleted = completions[key];
                    return (
                      <td key={day} className="text-center">
                        <button
                          onClick={() => onToggleHabit(habit.id, day)}
                          className={`w-6 h-6 rounded-md border transition-all ${
                            isCompleted
                              ? "bg-green-500 border-green-500 hover:scale-110 active: scale-110"
                              : "border-gray-500 hover:scale-110 active:scale-100 hover:bg-white/5"
                          }`}
                          disabled={saving}
                        >
                          {isCompleted && (
                            <Check className="w-3 z-0 h-4 mx-auto text-black" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                  <td className="text-center p-2">
                    <span
                      className={`text-sm font-bold ${
                        habitStats.percentage >= 70
                          ? "text-green-400"
                          : habitStats.percentage >= 40
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {habitStats.percentage}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CalendarView;
