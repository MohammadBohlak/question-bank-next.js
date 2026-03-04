// components/QuestionRecheckStatistics.tsx
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart } from 'lucide-react'

import { Question } from '@/app/[locale]/(course-supervisor)/question_recheck/page'

interface Statistics {
  totalQuestions: number;
  difficultyLevels: {
    easy: number;
    medium: number;
    hard: number;
  };
  questionTypes: {
    [type: string]: number;
  };
  byChapter: {
    [chapterId: string]: {
      title: string;
      count: number;
    };
  };
}

interface QuestionRecheckStatisticsProps {
  unconfirmedQuestions: Question[];
  showStatistics: boolean;
}

const QuestionRecheckStatistics: React.FC<QuestionRecheckStatisticsProps> = ({ unconfirmedQuestions, showStatistics }) => {
  const calculateStatistics = (): Statistics => {
    const stats: Statistics = {
      totalQuestions: unconfirmedQuestions.length,
      difficultyLevels: { easy: 0, medium: 0, hard: 0 },
      questionTypes: {},
      byChapter: {}
    }

    unconfirmedQuestions.forEach((question: Question) => {
      switch (question.difficultyLevel) {
        case 1: stats.difficultyLevels.easy++; break
        case 2: stats.difficultyLevels.medium++; break
        case 3: stats.difficultyLevels.hard++; break
      }

      const type = question.questionType?.name || 'Unknown'
      stats.questionTypes[type] = (stats.questionTypes[type] || 0) + 1

      const chapterId = question.chapter.id
      if (!stats.byChapter[chapterId]) {
        stats.byChapter[chapterId] = { title: question.chapter.title, count: 0 }
      }
      stats.byChapter[chapterId].count++
    })

    return stats
  }

  const statistics = calculateStatistics()
  if (!showStatistics) return null

  const difficultyColors = {
    easy: 'bg-success ',
    medium: 'bg-warning ',
    hard: 'bg-error '
  }

  const typeColor = 'bg-primary '
  const chapterColor = 'bg-secondary '

  return (
    <div
      className="rounded-xl p-6 shadow-md border bg-card-bg border-border "
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <PieChart className="w-6 h-6 text-primary " />
        <h3 className="text-xl font-semibold text-dark "> إحصائيات عامة</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Difficulty Levels */}
        <Card className='bg-card-bg border-border border shadow-md rounded'>
          <CardHeader>
            <CardTitle className="text-lg text-dark ">Difficulty Levels</CardTitle>
            <CardDescription className="text-text-secondary ">
              Distribution of question difficulty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(['easy', 'medium', 'hard'] as const).map(level => (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${difficultyColors[level]}`}></div>
                    <span className="text-text  capitalize">{level}</span>
                  </div>
                  <span className="font-semibold text-dark ">
                    {statistics.difficultyLevels[level]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question Types */}
        <Card className='bg-card-bg border-border border shadow-md rounded'
        >
          <CardHeader>
            <CardTitle className="text-lg text-dark ">Question Types</CardTitle>
            <CardDescription className="text-text-secondary ">
              Distribution of question types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statistics.questionTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${typeColor}`}></div>
                    <span className="truncate max-w-[120px]" title={type}>
                      {type}
                    </span>
                  </div>
                  <span className="font-semibold text-dark ">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Chapters */}
        <Card className='bg-card-bg border-border border shadow-md rounded'>
          <CardHeader>
            <CardTitle className="text-lg text-dark ">Top Chapters</CardTitle>
            <CardDescription className="text-text-secondary ">
              Questions per chapter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statistics.byChapter)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5)
                .map(([chapterId, { title, count }]) => (
                  <div key={chapterId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${chapterColor}`}></div>
                      <span className="truncate max-w-[120px]" title={title}>
                        {title}
                      </span>
                    </div>
                    <span className="font-semibold text-dark ">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default QuestionRecheckStatistics
