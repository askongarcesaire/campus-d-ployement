import React, { useState, useEffect } from 'react';
import {
  Heart, MessageCircle, Bookmark, Share2, MoreHorizontal,
  Send, Trash2, Pin, Sparkles, AlertCircle, FileText,
  Image as ImageIcon, Check, Flag, Award, BookOpen, Briefcase, Home, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Post, PostComment } from '../types';

interface FeedViewProps {
  savedOnly?: boolean;
}

export const FeedView: React.FC<FeedViewProps> = ({ savedOnly = false }) => {
  const { user, openAuthModal, openUserProfile, openReportModal } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Post creation state
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'GENERAL' | 'ACADEMIC' | 'SCHOLARSHIP' | 'INTERNSHIP' | 'HOUSING' | 'ADVICE'>('GENERAL');
  const [isPosting, setIsPosting] = useState(false);
  const [attachedUrl, setAttachedUrl] = useState('');
  const [attachedName, setAttachedName] = useState('');

  // Comments state per post
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, PostComment[]>>({});
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const categories = [
    { id: 'ALL', label: 'Toutes les publications' },
    { id: 'ACADEMIC', label: 'Académique & Cours' },
    { id: 'SCHOLARSHIP', label: 'Bourses' },
    { id: 'INTERNSHIP', label: 'Stages & Emploi' },
    { id: 'HOUSING', label: 'Logements' },
    { id: 'ADVICE', label: 'Conseils & Mémoire' },
  ];

  useEffect(() => {
    loadPosts();
  }, [categoryFilter, savedOnly]);

  const loadPosts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.posts.list({
        category: categoryFilter,
        savedOnly
      });
      setPosts(res.posts);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des publications.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!content.trim()) return;

    setIsPosting(true);
    try {
      const attachments = attachedUrl ? [{ url: attachedUrl, name: attachedName || 'Document joint' }] : [];
      const res = await api.posts.create({
        content,
        category: selectedCategory,
        attachments
      });
      setPosts([res.post, ...posts]);
      setContent('');
      setAttachedUrl('');
      setAttachedName('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await api.posts.like(postId);
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: res.liked,
            likes_count: res.likesCount
          };
        }
        return p;
      }));
    } catch (_err) {}
  };

  const handleBookmark = async (postId: string) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await api.posts.bookmark(postId);
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, isSaved: res.saved };
        }
        return p;
      }));
    } catch (_err) {}
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette publication ?')) return;
    try {
      await api.posts.delete(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleComments = async (postId: string) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }
    setActiveCommentsPostId(postId);
    if (!postComments[postId]) {
      try {
        const res = await api.posts.getComments(postId);
        setPostComments(prev => ({ ...prev, [postId]: res.comments }));
      } catch (_err) {}
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!commentInput.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await api.posts.addComment(postId, commentInput);
      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.comment]
      }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
      setCommentInput('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/#post-${postId}`;
    navigator.clipboard.writeText(url);
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2500);
  };

  return (
    <div className="space-y-5">
      
      {/* Feed Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {savedOnly ? 'Publications Enregistrées' : 'Fil d\'actualité Universitaire'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {savedOnly ? 'Vos publications mises en favoris pour consultation ultérieure' : 'Partages académiques, opportunités et entraide inter-universités'}
          </p>
        </div>

        {/* Category Filter Segments (Interactive Buttons) */}
        {!savedOnly && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  categoryFilter === c.id
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Post Composer (Only shown on main feed when logged in or prompts login) */}
      {!savedOnly && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
          {user ? (
            <form onSubmit={handleCreatePost} className="space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={user.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                  alt=""
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`Que souhaitez-vous partager avec la communauté, ${user.profile?.first_name || 'camarade'} ? (cours, question, bourse...)`}
                    className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-blue-600 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Attachment input toggle */}
              {attachedUrl !== '' && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-blue-700 shrink-0" />
                    <span className="truncate text-slate-800">{attachedName || attachedUrl}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setAttachedUrl(''); setAttachedName(''); }}
                    className="text-slate-400 hover:text-red-600 text-xs font-bold ml-2"
                  >
                    Retirer
                  </button>
                </div>
              )}

              {/* Category selector & Action bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">Catégorie :</span>
                  <select
                    value={selectedCategory}
                    onChange={(e: any) => setSelectedCategory(e.target.value)}
                    className="text-xs font-medium bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none"
                  >
                    <option value="GENERAL">Général</option>
                    <option value="ACADEMIC">Académique / Cours</option>
                    <option value="SCHOLARSHIP">Bourse d'études</option>
                    <option value="INTERNSHIP">Stage / Emploi</option>
                    <option value="HOUSING">Logement</option>
                    <option value="ADVICE">Conseils / Mémoire</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Collez l\'URL d\'une image ou d\'un document à joindre :');
                      if (url) {
                        setAttachedUrl(url);
                        setAttachedName('Document joint');
                      }
                    }}
                    className="text-slate-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Ajouter un lien / pièce jointe"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isPosting || !content.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPosting ? 'Publication...' : 'Publier'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-slate-600 mb-2 font-medium">
                Connectez-vous pour poser vos questions, publier des conseils ou partager des annonces de bourses.
              </p>
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm"
              >
                Se connecter pour publier
              </button>
            </div>
          )}
        </div>
      )}

      {/* Posts Stream */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-32 h-3.5 bg-slate-200 rounded" />
                  <div className="w-48 h-2.5 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="w-full h-12 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-800">Aucune publication trouvée</p>
          <p className="text-xs text-slate-500">
            Soyez le premier à partager une ressource ou une information académique !
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isAuthor = user && user.id === post.author_id;
            const canModerate = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');

            return (
              <article
                key={post.id}
                id={`post-${post.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all p-4 sm:p-5"
              >
                
                {/* Header: Author & Meta */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => openUserProfile(post.author_id)}
                    className="flex items-start gap-3 cursor-pointer group flex-1 min-w-0"
                  >
                    <img
                      src={post.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 truncate">
                          {post.first_name} {post.last_name}
                        </span>
                        {post.author_role === 'ADMIN' && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                        {post.author_role === 'MODERATOR' && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                            Modérateur
                          </span>
                        )}
                      </div>

                      {/* Clean Unboxed Metadata with · separator */}
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span className="truncate">{post.institution?.split('-')[0]?.trim()}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{post.field_of_study}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-400">
                          {new Date(post.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Pin / Category Indicator & Menu */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {post.is_pinned && (
                      <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                        <Pin className="w-3 h-3 text-amber-600" /> Épinglé
                      </span>
                    )}

                    <button
                      onClick={() => openReportModal('POST', post.id, post.content.substring(0, 40))}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Signaler ce post"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>

                    {(isAuthor || canModerate) && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="mt-3 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line break-words">
                  {post.content}
                </div>

                {/* Attachments if any */}
                {post.attachments && post.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {post.attachments.map((att, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate text-xs text-slate-800 font-medium">
                          <FileText className="w-4 h-4 text-blue-700 shrink-0" />
                          <span className="truncate">{att.name}</span>
                        </div>
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-blue-700 hover:text-blue-800 ml-2 shrink-0"
                        >
                          Consulter
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {/* Interactions Row */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4 sm:gap-6">
                    {/* Like button */}
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 font-semibold transition-colors ${
                        post.isLiked ? 'text-red-600' : 'hover:text-red-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-600 text-red-600' : ''}`} />
                      <span>{post.likes_count}</span>
                    </button>

                    {/* Comments toggle */}
                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="flex items-center gap-1.5 font-semibold hover:text-blue-700 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments_count}</span>
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => handleShare(post.id)}
                      className="flex items-center gap-1.5 font-semibold hover:text-slate-800 transition-colors"
                      title="Copier le lien"
                    >
                      {copiedPostId === post.id ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-600">Copié</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Partager</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => handleBookmark(post.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      post.isSaved ? 'text-amber-600' : 'hover:text-amber-600'
                    }`}
                    title="Enregistrer dans les favoris"
                  >
                    <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-amber-600' : ''}`} />
                  </button>
                </div>

                {/* Nested Comments Drawer */}
                {activeCommentsPostId === post.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    {/* Comment Input */}
                    {user ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post.id);
                          }}
                          placeholder="Écrire un commentaire bienveillant..."
                          className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={isSubmittingComment || !commentInput.trim()}
                          className="p-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl disabled:opacity-50 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-2 text-xs text-slate-500">
                        <span className="text-blue-700 font-semibold cursor-pointer" onClick={() => openAuthModal('login')}>
                          Connectez-vous
                        </span>{' '}
                        pour laisser un commentaire.
                      </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-2.5 max-h-60 overflow-y-auto">
                      {(postComments[post.id] || []).length === 0 ? (
                        <p className="text-[11px] text-slate-400 py-2 text-center">
                          Aucun commentaire pour l'instant. Soyez le premier à réagir !
                        </p>
                      ) : (
                        postComments[post.id].map((comment) => (
                          <div key={comment.id} className="p-2.5 bg-slate-50 rounded-xl flex items-start gap-2.5 text-xs">
                            <img
                              src={comment.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                              alt=""
                              className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 truncate">
                                  {comment.first_name} {comment.last_name}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </span>
                              </div>
                              <p className="text-slate-700 mt-0.5 leading-relaxed">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

              </article>
            );
          })}
        </div>
      )}

    </div>
  );
};
