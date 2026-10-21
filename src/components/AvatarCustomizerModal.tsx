import React, { useState } from 'react';
import { AvatarConfig } from '../types';
import { BitmojiAvatar, AVATAR_OPTIONS, DEFAULT_AVATAR } from './BitmojiAvatar';
import { X, Sparkles, Check, RotateCcw } from 'lucide-react';

interface AvatarCustomizerModalProps {
  isOpen: boolean;
  initialConfig?: AvatarConfig;
  onClose: () => void;
  onSave: (config: AvatarConfig) => void;
}

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  isOpen,
  initialConfig,
  onClose,
  onSave,
}) => {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || DEFAULT_AVATAR);
  const [activeTab, setActiveTab] = useState<'appearance' | 'outfit' | 'accessories'>('appearance');

  if (!isOpen) return null;

  const handleReset = () => {
    setConfig(DEFAULT_AVATAR);
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Customize Map Avatar</h2>
              <span className="text-[11px] text-slate-400">Personalize your cartoon officer/analyst pin</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Stage */}
        <div className="bg-slate-950/70 p-6 flex flex-col items-center justify-center border-b border-slate-800 relative">
          <div className="relative p-4 rounded-2xl bg-gradient-to-b from-blue-950/30 to-slate-900/40 border border-blue-900/30">
            <BitmojiAvatar config={config} size={110} showStand={true} />
          </div>
          <span className="text-xs font-semibold text-slate-300 mt-2">
            Map Presence Preview
          </span>
          <span className="text-[11px] text-slate-500">
            Appears on your live location and officer profile
          </span>

          <button
            onClick={handleReset}
            className="absolute top-3 right-3 text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 py-2.5 font-medium transition-colors border-b-2 ${
              activeTab === 'appearance'
                ? 'border-blue-500 text-blue-400 font-semibold bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Skin & Hair
          </button>
          <button
            onClick={() => setActiveTab('outfit')}
            className={`flex-1 py-2.5 font-medium transition-colors border-b-2 ${
              activeTab === 'outfit'
                ? 'border-blue-500 text-blue-400 font-semibold bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Outfit & Color
          </button>
          <button
            onClick={() => setActiveTab('accessories')}
            className={`flex-1 py-2.5 font-medium transition-colors border-b-2 ${
              activeTab === 'accessories'
                ? 'border-blue-500 text-blue-400 font-semibold bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Badge & Accessories
          </button>
        </div>

        {/* Options Body */}
        <div className="p-5 max-h-[320px] overflow-y-auto space-y-4">
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              {/* Skin Tone */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Skin Tone
                </label>
                <div className="flex items-center gap-3">
                  {AVATAR_OPTIONS.skinTones.map(tone => (
                    <button
                      key={tone.value}
                      type="button"
                      onClick={() => setConfig({ ...config, skinTone: tone.value })}
                      className={`w-9 h-9 rounded-full border-2 transition-transform ${
                        config.skinTone === tone.value
                          ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/30'
                          : 'border-slate-700 hover:scale-105'
                      }`}
                      style={{ backgroundColor: tone.value }}
                      title={tone.label}
                    />
                  ))}
                </div>
              </div>

              {/* Hair Style */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Hairstyle
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {AVATAR_OPTIONS.hairStyles.map(h => (
                    <button
                      key={h.value}
                      type="button"
                      onClick={() => setConfig({ ...config, hairStyle: h.value })}
                      className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors ${
                        config.hairStyle === h.value
                          ? 'bg-blue-600/30 border-blue-500 text-white font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Color */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Hair Color
                </label>
                <div className="flex items-center gap-3">
                  {AVATAR_OPTIONS.hairColors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setConfig({ ...config, hairColor: color.value })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        config.hairColor === color.value
                          ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/30'
                          : 'border-slate-700 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'outfit' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Clothing Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVATAR_OPTIONS.outfits.map(o => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setConfig({ ...config, outfit: o.value })}
                      className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors ${
                        config.outfit === o.value
                          ? 'bg-blue-600/30 border-blue-500 text-white font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Uniform / Clothing Hue
                </label>
                <div className="flex items-center gap-3">
                  {AVATAR_OPTIONS.outfitColors.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setConfig({ ...config, outfitColor: c.value })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        config.outfitColor === c.value
                          ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/30'
                          : 'border-slate-700 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'accessories' && (
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Equipment & Gear
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AVATAR_OPTIONS.accessories.map(acc => (
                  <button
                    key={acc.value}
                    type="button"
                    onClick={() => setConfig({ ...config, accessory: acc.value })}
                    className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors ${
                      config.accessory === acc.value
                        ? 'bg-blue-600/30 border-blue-500 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-950"
          >
            <Check className="w-3.5 h-3.5" />
            Apply & Save Avatar
          </button>
        </div>
      </div>
    </div>
  );
};
