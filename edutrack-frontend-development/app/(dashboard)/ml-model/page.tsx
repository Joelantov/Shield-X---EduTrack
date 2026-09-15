"use client"

import { useEffect, useState } from "react"
import {
  BrainCircuit,
  Cpu,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  BarChart3,
  Sliders,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Award,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { PageHeader } from "@/components/edutrack/page-header"
import { Card } from "@/components/edutrack/primitives"
import { fetchMLEvaluation, predictMLStudent } from "@/lib/api"
import { cn } from "@/lib/utils"

export default function MLModelPage() {
  const [evaluation, setEvaluation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Auto-feed simulation state
  const [isAutoFeeding, setIsAutoFeeding] = useState(false)
  const [feedIndex, setFeedIndex] = useState(0)
  const [feedHistory, setFeedHistory] = useState<any[]>([])

  // Sandbox slider form
  const [sandboxForm, setSandboxForm] = useState({
    current_score: 48,
    previous_score: 62,
    score_trend: -14,
    assignment_score: 52,
    quiz_score: 45,
    attendance: 72,
    engagement: 58,
    topic_accuracy: 42,
    submission_rate: 60,
    consecutive_declines: 3,
  })

  const [sandboxPrediction, setSandboxPrediction] = useState<any>(null)
  const [isPredicting, setIsPredicting] = useState(false)

  const loadModelEvaluation = async () => {
    setIsLoading(true)
    const data = await fetchMLEvaluation()
    if (data) {
      setEvaluation(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadModelEvaluation()
  }, [])

  // Auto-feed runner effect
  useEffect(() => {
    if (!isAutoFeeding || !evaluation?.sample_records) return

    const timer = setInterval(() => {
      setFeedIndex((prev) => {
        const next = prev + 1
        if (next >= evaluation.sample_records.length) {
          setIsAutoFeeding(false)
          return prev
        }
        setFeedHistory((h) => [evaluation.sample_records[prev], ...h])
        return next
      })
    }, 400)

    return () => clearInterval(timer)
  }, [isAutoFeeding, feedIndex, evaluation])

  const handleStartAutoFeed = () => {
    setFeedIndex(0)
    setFeedHistory([])
    setIsAutoFeeding(true)
  }

  const handleSandboxChange = (key: string, value: number) => {
    const updated = { ...sandboxForm, [key]: value }
    if (key === "current_score" || key === "previous_score") {
      updated.score_trend = updated.current_score - updated.previous_score
    }
    setSandboxForm(updated)
    runSandboxPredict(updated)
  }

  const runSandboxPredict = async (form: typeof sandboxForm) => {
    setIsPredicting(true)
    const res = await predictMLStudent(form)
    if (res) setSandboxPrediction(res)
    setIsPredicting(false)
  }

  useEffect(() => {
    runSandboxPredict(sandboxForm)
  }, [])

  if (isLoading || !evaluation) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 space-y-6 sm:px-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <BrainCircuit className="size-12 text-primary animate-bounce" />
          <p className="text-muted-foreground text-sm font-semibold">Loading LearnPulse AI Gap Classifier Evaluation Engine...</p>
        </div>
      </div>
    )
  }

  const { accuracy, total_test_samples, class_metrics, confusion_matrix, feature_importances, hyperparameters, sample_records } = evaluation

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-8 sm:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* PAGE HEADER */}
      <PageHeader
        title="AI / ML Model Inspector & Evaluation Lab"
        description="Analyze model architecture, hyperparameter specs, synthetic test batch evaluations, confusion matrix, and feature importances for LearnPulse Random Forest Classifier."
        action={
          <button
            type="button"
            onClick={loadModelEvaluation}
            className="inline-flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2 text-xs font-bold text-foreground transition-all hover:bg-muted"
          >
            <RefreshCw className="size-3.5 text-primary" />
            <span>Re-evaluate Model</span>
          </button>
        }
      />

      {/* 1. TOP METRICS HERO CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Overall Model Accuracy */}
        <Card className="p-5 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Model Accuracy</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Award className="size-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-foreground tabular-nums">{accuracy}%</span>
            <span className="text-xs font-bold text-success">Verified</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Evaluated on {total_test_samples} sample student test vectors</p>
        </Card>

        {/* Algorithm Type */}
        <Card className="p-5 border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Classifier</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Cpu className="size-4" />
            </span>
          </div>
          <div className="font-display text-xl font-bold text-foreground">{hyperparameters.model_type}</div>
          <p className="text-[11px] text-muted-foreground">{hyperparameters.n_estimators} Estimators • Depth {hyperparameters.max_depth}</p>
        </Card>

        {/* Classes Target */}
        <Card className="p-5 border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Output</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="size-4" />
            </span>
          </div>
          <div className="font-display text-xl font-bold text-foreground">3 Gap Categories</div>
          <p className="text-[11px] text-muted-foreground">Persistent Gap, Emerging Gap, Stable</p>
        </Card>

        {/* Feature Dimension */}
        <Card className="p-5 border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Input Dimension</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sliders className="size-4" />
            </span>
          </div>
          <div className="font-display text-xl font-bold text-foreground">{hyperparameters.n_features} Student Features</div>
          <p className="text-[11px] text-muted-foreground">Scores, Trends, Attendance, Declines</p>
        </Card>
      </div>

      {/* 2. AUTOMATIC ML DATA FEED & INTERACTIVE EVALUATOR */}
      <Card className="p-6 border-primary/20 space-y-6 shadow-md bg-card/60 backdrop-blur-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="size-5 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">Interactive ML Batch Auto-Feed Evaluator</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automatically stream student feature test samples into the trained Random Forest model and inspect real-time predictions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleStartAutoFeed}
              disabled={isAutoFeeding}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              <Play className="size-3.5 fill-current" />
              <span>{isAutoFeeding ? `Evaluating (${feedIndex + 1}/${sample_records.length})...` : "Run Auto-Feed Test Batch"}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Auto-Feed Test Progress</span>
            <span className="font-bold text-foreground">{Math.round(((feedHistory.length) / sample_records.length) * 100)}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-500 to-success transition-all duration-300"
              style={{ width: `${((feedHistory.length) / sample_records.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Live Streaming Feed Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Currently Evaluated Vector */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Activity className="size-4 text-primary" /> Active Input Feature Vector
            </h3>
            {feedHistory.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">{feedHistory[0].sample_id}</span>
                  <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", feedHistory[0].isCorrect ? "bg-success/10 text-success border-success/30" : "bg-destructive/10 text-destructive border-destructive/30")}>
                    {feedHistory[0].isCorrect ? "✅ Match" : "❌ Misclassification"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-muted/60 p-2">
                    <span className="text-[10px] text-muted-foreground block">Current Score</span>
                    <strong className="font-bold text-foreground">{feedHistory[0].features.current_score}%</strong>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-2">
                    <span className="text-[10px] text-muted-foreground block">Score Trend</span>
                    <strong className="font-bold text-foreground">{feedHistory[0].features.score_trend} pts</strong>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-2">
                    <span className="text-[10px] text-muted-foreground block">Attendance</span>
                    <strong className="font-bold text-foreground">{feedHistory[0].features.attendance}%</strong>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-2">
                    <span className="text-[10px] text-muted-foreground block">Consecutive Declines</span>
                    <strong className="font-bold text-foreground">{feedHistory[0].features.consecutive_declines} consecutive</strong>
                  </div>
                </div>
                <div className="border-t border-border pt-2 text-xs flex justify-between">
                  <span>Ground Truth: <strong className="text-foreground">{feedHistory[0].ground_truth}</strong></span>
                  <span>Model Output: <strong className="text-primary font-bold">{feedHistory[0].prediction}</strong></span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground italic">
                Click &quot;Run Auto-Feed Test Batch&quot; to stream sample feature vectors into the ML model.
              </div>
            )}
          </div>

          {/* Evaluated Log Stream */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Auto-Feed Evaluation Log</span>
              <span className="text-[10px] text-muted-foreground">{feedHistory.length} evaluated</span>
            </h3>
            <div className="h-48 overflow-y-auto space-y-2 no-scrollbar pr-1">
              {feedHistory.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 p-2 text-xs">
                  <div className="flex items-center gap-2">
                    {item.isCorrect ? <CheckCircle2 className="size-4 text-success shrink-0" /> : <XCircle className="size-4 text-destructive shrink-0" />}
                    <span className="font-mono font-bold text-foreground">{item.sample_id}</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-primary">{item.prediction}</span>
                    <span className="block text-[10px] text-muted-foreground">True: {item.ground_truth}</span>
                  </div>
                </div>
              ))}
              {feedHistory.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">Log will populate when auto-feed starts.</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 3. FEATURE IMPORTANCE & CONFUSION MATRIX */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Feature Importance Bar Chart */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-display font-bold text-base text-foreground">ML Feature Importance Ranking</h3>
              <p className="text-xs text-muted-foreground">Random Forest Gini Impurity feature weights</p>
            </div>
            <BarChart3 className="size-5 text-primary" />
          </div>

          <div className="space-y-3">
            {feature_importances.map((item: any) => (
              <div key={item.feature} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground">{item.feature}</span>
                  <span className="font-bold text-primary tabular-nums">{item.importance}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2 transition-all duration-500"
                    style={{ width: `${item.importance * 3.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Confusion Matrix & Class Metrics */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-display font-bold text-base text-foreground">Confusion Matrix & Class Metrics</h3>
              <p className="text-xs text-muted-foreground">True vs Predicted classifications on test dataset</p>
            </div>
            <BrainCircuit className="size-5 text-primary" />
          </div>

          {/* Matrix Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="p-2 text-left">True \ Predicted</th>
                  <th className="p-2 font-bold text-destructive">Persistent Gap</th>
                  <th className="p-2 font-bold text-amber-500">Emerging Gap</th>
                  <th className="p-2 font-bold text-success">Stable</th>
                </tr>
              </thead>
              <tbody>
                {confusion_matrix.map((row: any) => (
                  <tr key={row.true_label} className="border-b border-border/50">
                    <td className="p-2.5 text-left font-bold text-foreground">{row.true_label}</td>
                    <td className={cn("p-2.5 font-bold tabular-nums", row.true_label === "Persistent Gap" ? "bg-destructive/20 text-destructive rounded-md" : "text-muted-foreground")}>
                      {row["Persistent Gap"]}
                    </td>
                    <td className={cn("p-2.5 font-bold tabular-nums", row.true_label === "Emerging Gap" ? "bg-amber-500/20 text-amber-600 rounded-md" : "text-muted-foreground")}>
                      {row["Emerging Gap"]}
                    </td>
                    <td className={cn("p-2.5 font-bold tabular-nums", row.true_label === "Stable" ? "bg-success/20 text-success rounded-md" : "text-muted-foreground")}>
                      {row["Stable"]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Precision, Recall, F1 Breakdown */}
          <div className="grid grid-cols-3 gap-2 border-t border-border pt-4">
            {Object.entries(class_metrics).map(([cls, metrics]: [string, any]) => (
              <div key={cls} className="rounded-xl border border-border bg-muted/30 p-3 space-y-1 text-center">
                <span className="text-[11px] font-bold text-foreground block truncate">{cls}</span>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>Precision: <strong className="text-foreground">{metrics.precision}%</strong></p>
                  <p>Recall: <strong className="text-foreground">{metrics.recall}%</strong></p>
                  <p>F1 Score: <strong className="text-primary font-bold">{metrics.f1_score}%</strong></p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 4. INTERACTIVE LIVE PREDICTOR SANDBOX */}
      <Card className="p-6 border-primary/30 space-y-6 shadow-lg bg-card">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="size-5 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">Interactive Real-Time Model Sandbox</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Adjust student feature sliders to run real-time inference using the project&apos;s trained Random Forest ML model.
            </p>
          </div>
          <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary flex items-center gap-1.5">
            <Sparkles className="size-3.5" /> Live Inference
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sliders Form */}
          <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2 text-xs">
            <div>
              <div className="flex justify-between mb-1 font-semibold">
                <span>Current Score</span>
                <span className="font-bold text-primary">{sandboxForm.current_score}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={sandboxForm.current_score}
                onChange={(e) => handleSandboxChange("current_score", Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold">
                <span>Previous Score</span>
                <span className="font-bold text-primary">{sandboxForm.previous_score}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={sandboxForm.previous_score}
                onChange={(e) => handleSandboxChange("previous_score", Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold">
                <span>Topic Accuracy</span>
                <span className="font-bold text-primary">{sandboxForm.topic_accuracy}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={sandboxForm.topic_accuracy}
                onChange={(e) => handleSandboxChange("topic_accuracy", Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold">
                <span>Consecutive Declines</span>
                <span className="font-bold text-destructive">{sandboxForm.consecutive_declines}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={sandboxForm.consecutive_declines}
                onChange={(e) => handleSandboxChange("consecutive_declines", Number(e.target.value))}
                className="w-full accent-destructive cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold">
                <span>Attendance Rate</span>
                <span className="font-bold text-primary">{sandboxForm.attendance}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={sandboxForm.attendance}
                onChange={(e) => handleSandboxChange("attendance", Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold">
                <span>Quiz Score</span>
                <span className="font-bold text-primary">{sandboxForm.quiz_score}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={sandboxForm.quiz_score}
                onChange={(e) => handleSandboxChange("quiz_score", Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Model Output Result Panel */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Model Prediction Result
              </span>

              {sandboxPrediction ? (
                <div className="space-y-3">
                  <div className="rounded-xl bg-card border border-border p-4 shadow-sm text-center">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase block">Predicted Classification</span>
                    <h3 className="font-display text-2xl font-extrabold text-primary mt-1">
                      {sandboxPrediction.classification}
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="font-semibold text-foreground block">Probability Distribution:</span>
                    {Object.entries(sandboxPrediction.probabilities || {}).map(([cls, prob]: [string, any]) => (
                      <div key={cls} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">{cls}</span>
                          <span className="font-bold text-foreground">{Math.round(prob * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${Math.round(prob * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Adjust sliders to run real-time inference...</p>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground italic border-t border-border/60 pt-2">
              Powered by backend Random Forest Classifier (`gap_classifier.joblib`).
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
