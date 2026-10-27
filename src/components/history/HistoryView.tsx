/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ConversationSession, Language, NavigationTab } from '../../types';
import { translations } from '../../i18n/translations';
import { History, MessageSquare, Trash2, ArrowRight } from 'lucide-react';

interface HistoryViewProps {
  sessions: ConversationSession[];
  onSelectSession: (session: ConversationSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onNewSession: () => void;
  language: Language;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  onSelectSession,
  onDeleteSession,
  onNewSession,
  language,
}) => {
  const t = translations[language];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title Card */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-800 text-white flex items-center justify-center shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {t.history.title}
              </h1>
              <p className="text-xs text-stone-500">
                {t.history.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onNewSession}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t.history.newSession}</span>
          </button>
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-stone-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            {t.history.noHistory}
          </p>
          <div className="pt-2">
            <button
              onClick={onNewSession}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors"
            >
              <span>Ask Universal Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-xl p-5 border border-stone-200 flex items-center justify-between gap-4 hover:border-emerald-300 transition-colors shadow-2xs"
            >
              <div
                onClick={() => onSelectSession(session)}
                className="flex-1 cursor-pointer space-y-1"
              >
                <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono">
                  <span>{session.createdAt}</span>
                  <span aria-hidden="true">·</span>
                  <span>{session.messages.length} messages</span>
                </div>
                <h3 className="font-bold text-sm text-stone-900 hover:text-emerald-800 transition-colors">
                  {session.title}
                </h3>
                {session.messages.length > 0 && (
                  <p className="text-xs text-stone-600 line-clamp-1">
                    {session.messages[session.messages.length - 1].content}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onSelectSession(session)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium transition-colors"
                >
                  {t.history.loadSession}
                </button>
                <button
                  onClick={() => onDeleteSession(session.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                  title="Delete Session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
