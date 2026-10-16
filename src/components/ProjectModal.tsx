import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Tag, Calendar, User, Save, Layers, Sparkles, Trash2, AlertCircle } from 'lucide-react';
import { Project } from '../types';
import { api } from '../api';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
  onSaved: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
  onSaved,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Waste Management & Resource Recovery');
  const [subTheme, setSubTheme] = useState('Fostering Health, Nutrition & Well-Being through Clean Technology');
  const [leadResearcher, setLeadResearcher] = useState('NCSC Science Team');
  const [guideTeacher, setGuideTeacher] = useState('Dr. S. K. Raman');
  const [status, setStatus] = useState<Project['status']>('In Progress');
  const [targetExhibitionDate, setTargetExhibitionDate] = useState('2026-11-20');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setShortTitle(projectToEdit.shortTitle);
      setTagline(projectToEdit.tagline);
      setDescription(projectToEdit.description);
      setCategory(projectToEdit.category);
      setSubTheme(projectToEdit.subTheme);
      setLeadResearcher(projectToEdit.leadResearcher);
      setGuideTeacher(projectToEdit.guideTeacher);
      setStatus(projectToEdit.status);
      setTargetExhibitionDate(projectToEdit.targetExhibitionDate);
      setTagsInput(projectToEdit.tags.join(', '));
    } else {
      setName('');
      setShortTitle('');
      setTagline('');
      setDescription('');
      setCategory('Waste Management & Resource Recovery');
      setSubTheme('Fostering Health, Nutrition & Well-Being through Clean Technology');
      setLeadResearcher('NCSC Science Team');
      setGuideTeacher('Dr. S. K. Raman');
      setStatus('In Progress');
      setTargetExhibitionDate('2026-11-20');
      setTagsInput('NCSC, Science Project, Innovation');
    }
    setError('');
    setConfirmDelete(false);
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Project title is required.');
      return;
    }

    setLoading(true);
    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      const payload: Partial<Project> = {
        name: name.trim(),
        shortTitle: shortTitle.trim() || name.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        category,
        subTheme,
        leadResearcher,
        guideTeacher,
        status,
        targetExhibitionDate,
        tags,
      };

      let result: Project;
      if (projectToEdit) {
        result = await api.updateProject(projectToEdit.id, payload);
      } else {
        result = await api.createProject(payload);
      }
      onSaved(result);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save science project');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToEdit) return;
    setDeleting(true);
    try {
      await api.deleteProject(projectToEdit.id);
      if (onDelete) {
        onDelete(projectToEdit.id);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete project');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {projectToEdit ? 'Edit Science Project Details' : 'Register New NCSC Science Project'}
              </h2>
              <p className="text-xs text-slate-400">
                Organize documents, 3D simulations, firmware, datasets, and competition milestones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delete Confirmation Warning */}
        {confirmDelete && projectToEdit && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-red-950/60 border border-red-500/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Are you sure you want to permanently remove "{projectToEdit.name}"?</span>
            </div>
            <p className="text-[11px] text-red-200/80">
              All stored drive files, custom folders, experiment logs, and BOM entries for this project will be deleted. This action cannot be reversed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={deleting}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-md"
              >
                {deleting ? 'Deleting Project...' : 'Yes, Permanently Delete Project'}
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Full Project Title *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Smart Waste-to-Resource System"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Short Name / Navigation Tag
              </label>
              <input
                type="text"
                value={shortTitle}
                onChange={(e) => setShortTitle(e.target.value)}
                placeholder="e.g. Smart Waste System"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                NCSC Focus Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              >
                <option value="Waste Management & Resource Recovery">Waste Management & Resource Recovery</option>
                <option value="Clean Water & Renewable Energy">Clean Water & Renewable Energy</option>
                <option value="Agriculture & Food Security">Agriculture & Food Security</option>
                <option value="Smart Healthcare & Assistive Tech">Smart Healthcare & Assistive Tech</option>
                <option value="Climate Change & Ecosystem Preservation">Climate Change & Ecosystem Preservation</option>
                <option value="Artificial Intelligence & IoT Systems">Artificial Intelligence & IoT Systems</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Project Tagline / Core Hypothesis Summary
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. AI-Powered Intelligent Waste Segregation & Dual Recovery"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Congress Competition Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              >
                <option value="In Progress">In Progress (Research & Prototyping)</option>
                <option value="Regional Finalist">Regional Finalist</option>
                <option value="State Selection">State Selection</option>
                <option value="National Finalist">National Finalist</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-400" />
                Target Exhibition Date
              </label>
              <input
                type="date"
                value={targetExhibitionDate}
                onChange={(e) => setTargetExhibitionDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-cyan-400" />
                Lead Student Researcher / Team
              </label>
              <input
                type="text"
                value={leadResearcher}
                onChange={(e) => setLeadResearcher(e.target.value)}
                placeholder="Team Leader Names"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-cyan-400" />
                Guide Teacher / Faculty Mentor
              </label>
              <input
                type="text"
                value={guideTeacher}
                onChange={(e) => setGuideTeacher(e.target.value)}
                placeholder="Dr. S. K. Raman"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Project Abstract / Detailed Overview
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive synopsis of the problem, hypothesis, methodology, and expected societal impact..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-cyan-400" />
              Keywords & Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="AI Classification, ESP32, 3D Simulation, Biogas, Pyrolysis"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            {projectToEdit ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/50 border border-red-900/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Project</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Saving Project...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    {projectToEdit ? 'Update Project' : 'Register Project'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
