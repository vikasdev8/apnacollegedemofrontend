"use client";

import { useCreateProblemMutation, useGetTopicsQuery } from '../../../../store/dsaApi';
import { useState } from 'react';

export default function NewProblemPage() {
  const { data: topics } = useGetTopicsQuery();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topicId, setTopicId] = useState("");
  const [difficulty, setDifficulty] = useState<'Easy'|'Medium'|'Hard'>('Easy');
  const [youtubeLink, setYoutubeLink] = useState("");
  const [leetcodeLink, setLeetcodeLink] = useState("");
  const [codeforcesLink, setCodeforcesLink] = useState("");
  const [articleLink, setArticleLink] = useState("");
  const [order, setOrder] = useState<number | "">("");
  const [createProblem, { isLoading, error, isSuccess }] = useCreateProblemMutation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProblem({ title, description, topicId, difficulty, youtubeLink: youtubeLink || undefined, leetcodeLink: leetcodeLink || undefined, codeforcesLink: codeforcesLink || undefined, articleLink: articleLink || undefined, order: order === '' ? undefined : Number(order) }).unwrap();
    setTitle("");
    setDescription("");
    setTopicId("");
    setDifficulty('Easy');
    setYoutubeLink("");
    setLeetcodeLink("");
    setCodeforcesLink("");
    setArticleLink("");
    setOrder("");
    alert('Problem created');
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Create Problem</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input className="border p-2 w-full" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea className="border p-2 w-full" value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Topic</label>
          <select className="border p-2 w-full" value={topicId} onChange={e => setTopicId(e.target.value)} required>
            <option value="" disabled>Select a topic</option>
            {topics?.map(t => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Difficulty</label>
          <select
            className="border p-2 w-full"
            value={difficulty}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')
            }
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">YouTube Link</label>
          <input className="border p-2 w-full" value={youtubeLink} onChange={e => setYoutubeLink(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">LeetCode Link</label>
          <input className="border p-2 w-full" value={leetcodeLink} onChange={e => setLeetcodeLink(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Codeforces Link</label>
          <input className="border p-2 w-full" value={codeforcesLink} onChange={e => setCodeforcesLink(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Article Link</label>
          <input className="border p-2 w-full" value={articleLink} onChange={e => setArticleLink(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Order (optional)</label>
          <input className="border p-2 w-full" type="number" value={order} onChange={e => setOrder(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <button disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {isLoading ? 'Creating...' : 'Create Problem'}
        </button>
        {error && <p className="text-red-600 text-sm">Error creating problem</p>}
        {isSuccess && <p className="text-green-700 text-sm">Created successfully</p>}
      </form>
    </div>
  );
}
