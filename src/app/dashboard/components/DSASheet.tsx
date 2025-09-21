import React, { useMemo, useState } from 'react';
import { useGetDsaSheetQuery, useGetUserStatsQuery, useUpdateProgressMutation } from '../../../store/dsaApi';
import { ChevronDown, ChevronRight, ExternalLink, Trophy, Target, BookOpen, TrendingUp } from 'lucide-react';
import type { TopicWithProgress, ProblemWithProgress, ChapterWithTopics } from '../../../store/dsaApi';

export default function DSASheet() {
  const { data: dsaSheet, isLoading: isSheetLoading, error: sheetError } = useGetDsaSheetQuery();
  const { data: stats, isLoading: isStatsLoading, error: statsError } = useGetUserStatsQuery();
  const [updateProgress] = useUpdateProgressMutation();
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);

  // Flatten chapters->topics and compute filtered topics list unconditionally
  const topicsList: TopicWithProgress[] = useMemo(() => {
    if (!dsaSheet) return [];
    const chapters = dsaSheet as ChapterWithTopics[];
    return chapters.flatMap((ch) => ch.topics || []);
  }, [dsaSheet]);

  const filteredSheet = useMemo(() => {
    const q = search.trim().toLowerCase();
    const diff = difficulty;
    return topicsList
      .map((topic) => {
        const filteredProblems = topic.problems.filter((p) => {
          const matchesQuery = q
            ? p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
            : true;
          const matchesDiff = diff === 'All' ? true : p.difficulty === diff;
          const matchesIncomplete = showOnlyIncomplete ? !p.progress.isCompleted : true;
          return matchesQuery && matchesDiff && matchesIncomplete;
        });
        const completedCount = filteredProblems.filter((p) => p.progress.isCompleted).length;
        return {
          ...topic,
          problems: filteredProblems,
          completedProblems: completedCount,
          totalProblems: filteredProblems.length,
          completionPercentage:
            filteredProblems.length > 0
              ? Math.round((completedCount / filteredProblems.length) * 100)
              : 0,
        } as TopicWithProgress;
      })
      .filter((t) => t.problems.length > 0 || q.length === 0);
  }, [topicsList, search, difficulty, showOnlyIncomplete]);

  const toggleTopic = (topicId: string) => {
    setOpenTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const handleProgressUpdate = async (problemId: string, isCompleted: boolean) => {
    try {
      await updateProgress({ problemId, isCompleted }).unwrap();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleTopicBulk = async (topicId: string, complete: boolean) => {
    const topic = topicsList.find((t) => t._id === topicId);
    if (!topic) return;
    const updates = topic.problems.map(p => updateProgress({ problemId: p._id, isCompleted: complete }).unwrap());
    try {
      await Promise.all(updates);
    } catch (e) {
      console.error('Bulk update failed', e);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isSheetLoading || isStatsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your DSA Sheet...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error states (e.g., unauthorized)
  const unauthorized = (sheetError as any)?.status === 401 || (statsError as any)?.status === 401;
  if (unauthorized) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md border text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in to view your DSA Sheet</h3>
          <p className="text-gray-600">You need to be authenticated to load topics, problems, and your progress.</p>
        </div>
      </div>
    );
  }

  const expandAll = () => {
    if (topicsList.length === 0) return;
    const next: Record<string, boolean> = {};
    for (const t of topicsList) next[t._id] = true;
    setOpenTopics(next);
  };

  const collapseAll = () => setOpenTopics({});

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DSA Sheet</h1>
        <p className="text-gray-600">Track your Data Structures and Algorithms progress</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md border p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <input
            type="text"
            placeholder="Search problems by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
          />
          <select
            className="border rounded px-3 py-2"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'All' | 'Easy' | 'Medium' | 'Hard')}
          >
            <option>All</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showOnlyIncomplete}
              onChange={(e) => setShowOnlyIncomplete(e.target.checked)}
              className="h-4 w-4"
            />
            Show only incomplete
          </label>
          <div className="ml-auto flex gap-2">
            <button onClick={expandAll} className="px-3 py-2 border rounded">Expand all</button>
            <button onClick={collapseAll} className="px-3 py-2 border rounded">Collapse all</button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Progress</p>
                  <p className="text-2xl font-bold">{stats.completionPercentage}%</p>
                </div>
                <Trophy className="h-8 w-8 text-blue-200" />
              </div>
              <div className="mt-4 bg-blue-400 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedProblems}</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Remaining</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.remainingProblems}</p>
                </div>
                <BookOpen className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Problems</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProblems}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Difficulty Stats */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md border mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress by Difficulty</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.difficultyStats.Easy}</div>
                <p className="text-sm text-gray-600 mb-2">Easy Problems</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  Easy
                </span>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.difficultyStats.Medium}</div>
                <p className="text-sm text-gray-600 mb-2">Medium Problems</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                  Medium
                </span>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">{stats.difficultyStats.Hard}</div>
                <p className="text-sm text-gray-600 mb-2">Hard Problems</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                  Hard
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DSA Topics */}
      <div className="space-y-4">
        {filteredSheet.map((topic: TopicWithProgress) => (
          <div key={topic._id} className="bg-white rounded-lg shadow-md border overflow-hidden">
            <div 
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleTopic(topic._id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {openTopics[topic._id] ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{topic.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {topic.completedProblems} / {topic.totalProblems}
                    </p>
                    <p className="text-xs text-gray-500">
                      {topic.completionPercentage}% complete
                    </p>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${topic.completionPercentage}%` }}
                    />
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleTopicBulk(topic._id, true); }}
                      className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
                    >
                      Mark all complete
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleTopicBulk(topic._id, false); }}
                      className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
                    >
                      Mark all incomplete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {openTopics[topic._id] && (
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  {topic.problems.map((problem: ProblemWithProgress) => (
                    <div
                      key={problem._id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        problem.progress.isCompleted 
                          ? "bg-green-50 border-green-200" 
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <input
                          type="checkbox"
                          checked={problem.progress.isCompleted}
                          onChange={(e) => handleProgressUpdate(problem._id, e.target.checked)}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className={`font-medium ${
                              problem.progress.isCompleted 
                                ? "line-through text-gray-500" 
                                : "text-gray-900"
                            }`}>
                              {problem.title}
                            </h4>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {problem.description}
                          </p>
                          
                          {/* External Links */}
                          <div className="flex flex-wrap gap-2">
                            {problem.leetcodeLink && (
                              <a
                                href={problem.leetcodeLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                              >
                                <span>LeetCode</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            
                            {problem.youtubeLink && (
                              <a
                                href={problem.youtubeLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                              >
                                <span>YouTube</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            
                            {problem.codeforcesLink && (
                              <a
                                href={problem.codeforcesLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                              >
                                <span>Codeforces</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            
                            {problem.articleLink && (
                              <a
                                href={problem.articleLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                              >
                                <span>Article</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {topicsList.length === 0 && (
        <div className="bg-white rounded-lg shadow-md border text-center py-12 mt-6">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No DSA Topics Found</h3>
          <p className="text-gray-600">If you just ran the seed, try refreshing. Otherwise, contact an admin to add chapters, topics, and problems.</p>
        </div>
      )}

      {topicsList.length > 0 && filteredSheet.length === 0 && (
        <div className="bg-white rounded-lg shadow-md border text-center py-12 mt-6">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Results</h3>
          <p className="text-gray-600">Try clearing the search or filters to see all topics.</p>
        </div>
      )}
    </div>
  );
}