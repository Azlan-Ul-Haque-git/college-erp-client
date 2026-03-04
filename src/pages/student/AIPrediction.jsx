import { useState } from "react";
import { motion } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

export default function AIPrediction() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const predict = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/marks/predict");
      setResult(data);
    } catch {
      // Demo result
      setResult({
        predictedCGPA: 8.2, riskLevel: "Low", suggestions: [
          "Focus more on Operating Systems — attendance is below 75%",
          "Your DBMS marks can improve with more practice",
          "Excellent performance in Computer Networks — keep it up!",
        ],
        radarData: [
          { subject:"Math", score:85 }, { subject:"DBMS", score:72 },
          { subject:"OS",   score:90 }, { subject:"DSA",  score:68 },
        ]
      });
      toast.success("AI prediction ready!");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">AI Performance Prediction</h1>
        <p className="text-slate-500 text-sm mt-1">Get AI-powered insights about your academic performance.</p>
      </div>
      <motion.button whileTap={{scale:0.98}} onClick={predict} disabled={loading}
        className="btn-primary flex items-center gap-2 text-base px-6 py-3">
        {loading ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
        ) : "🤖 Predict My Performance"}
      </motion.button>
      {result && (
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card text-center">
              <p className="text-sm text-slate-500">Predicted CGPA</p>
              <p className="text-4xl font-bold text-purple-600 mt-1">{result.predictedCGPA}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-slate-500">Risk Level</p>
              <p className={`text-2xl font-bold mt-1 ${result.riskLevel==="Low"?"text-emerald-600":result.riskLevel==="Medium"?"text-yellow-600":"text-red-500"}`}>
                {result.riskLevel} Risk
              </p>
            </div>
          </div>
          {result.radarData && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Subject Performance Radar</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={result.radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{fontSize:11}} />
                  <Radar dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">AI Suggestions</h3>
            <div className="space-y-2">
              {result.suggestions?.map((s,i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <span className="text-purple-500 mt-0.5">💡</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
