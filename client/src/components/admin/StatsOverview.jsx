import React from 'react';
import { TeacherIcon, UsersIcon, ExamIcon, SparklesIcon } from './Icons';

export const StatsOverview = ({ stats, onPendingClick }) => {
  const cards = [
    {
      label: 'Total Teachers',
      value: stats.totalTeachers ?? 0,
      subtext: stats.pendingTeachers > 0 ? `${stats.pendingTeachers} awaiting approval` : 'All verified',
      hasBadge: stats.pendingTeachers > 0,
      icon: TeacherIcon,
      color: 'indigo',
      onClick: stats.pendingTeachers > 0 ? onPendingClick : undefined
    },
    {
      label: 'Enrolled Students',
      value: stats.totalStudents ?? 0,
      subtext: `${stats.blockedUsers ?? 0} blocked accounts`,
      hasBadge: false,
      icon: UsersIcon,
      color: 'emerald'
    },
    {
      label: 'Exams This Week',
      value: stats.examsThisWeek ?? 0,
      subtext: `${stats.totalClasses ?? 0} active courses`,
      hasBadge: false,
      icon: ExamIcon,
      color: 'blue'
    },
    {
      label: 'AI Questions Drafted',
      value: stats.aiGenerations ?? 0,
      subtext: 'Questions drafted via LLM',
      hasBadge: false,
      icon: SparklesIcon,
      color: 'purple'
    }
  ];

  return (
    <div className="stats-row">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="metric-card"
            style={{ cursor: card.onClick ? 'pointer' : 'default' }}
            onClick={card.onClick}
          >
            <div className="metric-info">
              <span className="metric-label">{card.label}</span>
              <span className="metric-val">{card.value}</span>
              <div className="metric-sub">
                {card.hasBadge ? (
                  <span className="metric-sub-pill">{card.subtext}</span>
                ) : (
                  <span>{card.subtext}</span>
                )}
              </div>
            </div>
            <div className={`metric-icon-box ${card.color}`}>
              <Icon size={20} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
