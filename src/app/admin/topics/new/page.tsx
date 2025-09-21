"use client";

import { useCreateTopicMutation } from '../../../../store/dsaApi';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

export default function NewTopicPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState<number | "">("");
  const [createTopic, { isLoading, error, isSuccess }] = useCreateTopicMutation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTopic({ 
        name, 
        description, 
        order: order === '' ? undefined : Number(order) 
      }).unwrap();
      setName("");
      setDescription("");
      setOrder("");
      alert('Topic created successfully');
    } catch (error) {
      console.error("Failed to create topic:", error);
      // Error is handled by RTK Query and will be available in the `error` variable
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Create Topic</h1>
        <button 
          onClick={() => router.push('/admin')}
          className="text-blue-600 hover:underline"
        >
          Back to Admin
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Topic Name</label>
          <input 
            className="border p-2 w-full rounded" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Array, Linked List, Dynamic Programming, etc."
            required 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea 
            className="border p-2 w-full rounded h-24" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="A short description of this topic and what students will learn"
            required 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Display Order (optional)</label>
          <input 
            className="border p-2 w-full rounded" 
            type="number" 
            min="0"
            value={order} 
            onChange={e => setOrder(e.target.value === '' ? '' : Number(e.target.value))} 
            placeholder="0, 1, 2, etc. - Controls the sorting order" 
          />
          <p className="text-xs text-gray-500 mt-1">Topics are displayed in ascending order</p>
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {(() => {
              const e = error as FetchBaseQueryError | SerializedError | undefined;
              if (!e) return 'Error creating topic. Please try again.';
              if ('data' in e) {
                const data = e.data;
                if (data && typeof data === 'object' && 'message' in (data as Record<string, unknown>)) {
                  const msg = (data as { message?: string }).message;
                  if (msg) return msg;
                }
              }
              if (typeof (e as SerializedError).message === 'string' && (e as SerializedError).message) {
                return (e as SerializedError).message as string;
              }
              return 'Error creating topic. Please try again.';
            })()}
          </div>
        )}
        
        {isSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
            Topic created successfully!
          </div>
        )}
        
        <div className="flex items-center justify-end space-x-3 pt-3">
          <button 
            type="button"
            onClick={() => router.push('/admin')}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isLoading || !name || !description} 
            className={`bg-blue-600 text-white px-4 py-2 rounded ${(isLoading || !name || !description) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          >
            {isLoading ? 'Creating...' : 'Create Topic'}
          </button>
        </div>
      </form>
    </div>
  );
}
