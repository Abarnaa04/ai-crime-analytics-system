import React, { useMemo } from 'react';
import { computeModelEvaluation } from '../utils/modelEvaluation';
import { 
  CheckCircle2, 
  Target, 
  BarChart, 
  Layers, 
  ShieldCheck, 
  BrainCircuit, 
  Sliders
} from 'lucide-react';
import { PageHeader } from './PageHeader';

interface ModelEvaluationViewProps {
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export const ModelEvaluationView: React.FC<ModelEvaluationViewProps> = ({
  onBack = () => {},
  onNavigate,
}) => {
  const evalData = useMemo(() => computeModelEvaluation(), []);

  return (
    <div className="space-y-8">
      {/* Universal Page Header with Visible Back Button */}
      <PageHeader
        title="Model Evaluation & Confusion Matrix"
        subtitle={`Empirical validation metrics computed on held-out test split (80/20 train-test ratio, ${evalData.totalTestSamples} evaluated test records).`}
        onBack={onBack}
        breadcrumbs={[
          { label: 'Dashboard', view: 'dashboard' },
          { label: 'Model Evaluation' }
        ]}
        onNavigate={onNavigate}
        badge={
          <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
            <span>F1-Score: {evalData.macroF1}%</span>
          </span>
        }
      />

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Accuracy */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">Overall Model Accuracy</span>
          <span className="text-3xl font-bold font-mono tabular-nums text-white">
            {evalData.accuracy}%
          </span>
          <span className="text-[11px] text-emerald-400 block pt-1">
            Correctly classified test cases
          </span>
        </div>

        {/* Macro Precision */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">Macro Precision</span>
          <span className="text-3xl font-bold font-mono tabular-nums text-blue-400">
            {evalData.macroPrecision}%
          </span>
          <span className="text-[11px] text-slate-400 block pt-1">
            TP / (TP + FP) across classes
          </span>
        </div>

        {/* Macro Recall */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">Macro Recall</span>
          <span className="text-3xl font-bold font-mono tabular-nums text-purple-400">
            {evalData.macroRecall}%
          </span>
          <span className="text-[11px] text-slate-400 block pt-1">
            TP / (TP + FN) across classes
          </span>
        </div>

        {/* Macro F1 Score */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">Macro F1-Score</span>
          <span className="text-3xl font-bold font-mono tabular-nums text-emerald-400">
            {evalData.macroF1}%
          </span>
          <span className="text-[11px] text-slate-400 block pt-1">
            Harmonic precision/recall mean
          </span>
        </div>
      </div>

      {/* Confusion Matrix Section */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-semibold text-white">Multi-Class Confusion Matrix</h2>
            <p className="text-xs text-slate-400">
              Rows represent Ground Truth (Actual Offense) · Columns represent Model Inferences (Predicted Offense)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-600 rounded-sm inline-block" />
              <span>True Positives (Diagonal)</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left font-sans text-slate-400 font-medium">
                  Actual \ Predicted
                </th>
                {evalData.classes.map(c => (
                  <th key={c} className="p-2 font-mono text-[11px] text-slate-300 font-medium whitespace-nowrap">
                    {c.length > 10 ? c.slice(0, 8) + '..' : c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {evalData.classes.map((actualClass, rowIdx) => (
                <tr key={actualClass} className="hover:bg-slate-800/30">
                  <td className="p-2.5 text-left font-sans font-medium text-slate-200 whitespace-nowrap">
                    {actualClass}
                  </td>
                  {evalData.classes.map((predClass, colIdx) => {
                    const count = evalData.confusionMatrix[rowIdx][colIdx];
                    const isDiagonal = rowIdx === colIdx;

                    let bgClass = 'bg-slate-950/40 text-slate-500';
                    if (isDiagonal && count > 0) {
                      bgClass = 'bg-blue-600/70 text-white font-bold';
                    } else if (!isDiagonal && count > 0) {
                      bgClass = 'bg-slate-800/70 text-amber-400 font-medium';
                    }

                    return (
                      <td key={predClass} className="p-1">
                        <div className={`py-1.5 px-2 rounded ${bgClass} tabular-nums text-xs`}>
                          {count}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Column Split: Per-Class Table & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Per-Class Metrics (7 columns) */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-semibold text-white">Class-by-Class Metric Decomposition</h2>
            <span className="text-xs font-mono text-slate-400">{evalData.classes.length} Offenses</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium font-sans">
                  <th className="pb-2 font-medium">Offense</th>
                  <th className="pb-2 font-medium text-right">Precision</th>
                  <th className="pb-2 font-medium text-right">Recall</th>
                  <th className="pb-2 font-medium text-right">F1-Score</th>
                  <th className="pb-2 font-medium text-right">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {evalData.perClassMetrics.map(item => (
                  <tr key={item.category} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-sans font-medium text-slate-200">{item.category}</td>
                    <td className="py-2.5 text-right tabular-nums text-blue-400">{item.precision}%</td>
                    <td className="py-2.5 text-right tabular-nums text-purple-400">{item.recall}%</td>
                    <td className="py-2.5 text-right tabular-nums text-emerald-400 font-semibold">{item.f1}%</td>
                    <td className="py-2.5 text-right tabular-nums text-slate-400">{item.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Importance & CV (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Feature Importance */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h2 className="text-sm font-semibold text-white">Feature Weight Breakdown</h2>
              <p className="text-[11px] text-slate-400">Empirical information gain / Gini impurity reduction</p>
            </div>

            <div className="space-y-3">
              {evalData.featureImportance.map(f => (
                <div key={f.feature} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{f.feature}</span>
                    <span className="font-mono text-emerald-400 tabular-nums">{f.importancePercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${f.importancePercentage * 2.5}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{f.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 5-Fold Cross Validation */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="border-b border-slate-800 pb-2">
              <h2 className="text-sm font-semibold text-white">5-Fold Stratified Cross-Validation</h2>
              <p className="text-[11px] text-slate-400">Verifying model stability against overfitting</p>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
              {evalData.crossValidationSummary.map(fold => (
                <div key={fold.fold} className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-sans">Fold {fold.fold}</div>
                  <div className="font-bold text-white mt-1">{fold.accuracy}%</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">{fold.f1Score} F1</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
