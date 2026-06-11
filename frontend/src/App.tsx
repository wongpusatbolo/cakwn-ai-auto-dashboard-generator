import React, { useState } from 'react';
import { 
  LayoutDashboard, Database, MessageSquare, LineChart, 
  Settings, BrainCircuit, Upload, FileSpreadsheet, 
  AlertCircle, Activity, Download, Layers, TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart as RechartsLineChart, Line } from 'recharts';

const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [fileData, setFileData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([
    { role: 'ai', content: 'Hello! I am CakwnAI Auto Dashboard Engine. Ask me anything about your generated charts.' }
  ]);

  const COLORS = ['#00d9ff', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append('file', file);
    
    setIsUploading(true);
    try {
      const res = await axios.post(`${API_URL}/upload`, formData);
      setFileData(res.data);
      
      // Auto Generate Dashboard
      const dashRes = await axios.post(`${API_URL}/generate_dashboard?filename=${res.data.filename}`);
      setDashboardData(dashRes.data);
      setActiveTab('dashboard');
    } catch (err) {
      alert('Error uploading file. Make sure backend is running on port 8000.');
      console.error(err);
    }
    setIsUploading(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const newHistory = [...chatHistory, { role: 'user', content: chatInput }];
    setChatHistory(newHistory);
    setChatInput('');
    try {
      const res = await axios.post(`${API_URL}/chat?query=${encodeURIComponent(chatInput)}`);
      setChatHistory([...newHistory, { role: 'ai', content: res.data.reply }]);
    } catch (err) {
      setChatHistory([...newHistory, { role: 'ai', content: 'System Error: AI unreachable.' }]);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-slate-200">
      {/* Sidebar */}
      <div className="w-64 glass flex flex-col z-20 border-r border-white/5">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white glow-text">
            <BrainCircuit className="text-primary" /> CakwnAI
          </h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Auto Dashboard Gen</p>
        </div>
        
        <div className="flex-1 py-4 flex flex-col gap-2 px-4">
          <NavButton icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavButton icon={<Database />} label="Data Source" active={activeTab === 'upload'} onClick={() => setActiveTab('upload')} />
          <NavButton icon={<TrendingUp />} label="Insights & AI" active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
          <NavButton icon={<MessageSquare />} label="Chat Data" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="p-8 max-w-7xl mx-auto">
          
          {/* UPLOAD VIEW */}
          {activeTab === 'upload' && (
            <div className="max-w-3xl mx-auto mt-10">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-white mb-4">Transform Any Dataset Into Intelligent Dashboards <span className="text-primary glow-text">Instantly</span></h2>
                <p className="text-slate-400">Supported: CSV, Excel, JSON, Parquet</p>
              </div>
              
              <label className="border-2 border-dashed border-primary/40 rounded-2xl p-20 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors glass">
                {isUploading ? (
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
                ) : (
                  <Upload size={64} className="text-primary mb-6 drop-shadow-[0_0_15px_rgba(0,217,255,0.5)]" />
                )}
                <h3 className="text-2xl font-semibold mb-2">{isUploading ? 'AI is Building Dashboard...' : 'Drag & Drop Dataset'}</h3>
                <input type="file" className="hidden" accept=".csv,.xlsx,.json,.parquet" onChange={handleFileUpload} />
              </label>
            </div>
          )}

          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && dashboardData && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white">Auto-Generated Dashboard</h2>
                  <p className="text-slate-400">Source: <span className="text-primary">{fileData?.filename}</span> | Quality Score: <span className="text-success font-bold">{fileData?.quality_score.toFixed(1)}/100</span></p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 glass rounded-lg flex items-center gap-2 hover:bg-white/5 transition-colors">
                    <Layers size={18} /> Layout
                  </button>
                  <button className="px-4 py-2 bg-primary text-slate-900 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/80 transition-colors">
                    <Download size={18} /> Export PDF
                  </button>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {dashboardData.kpis.map((kpi: any, idx: number) => (
                  <div key={idx} className="glass p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-colors">
                    <p className="text-slate-400 text-sm mb-2">{kpi.title}</p>
                    <h3 className="text-3xl font-bold text-white mb-2">{kpi.value > 1000 ? (kpi.value/1000).toFixed(1) + 'k' : kpi.value.toFixed(2)}</h3>
                    <div className={`text-xs font-bold flex items-center gap-1 ${kpi.trend >= 0 ? 'text-success' : 'text-danger'}`}>
                      {kpi.trend >= 0 ? '↑' : '↓'} {Math.abs(kpi.trend)}% vs last period
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dashboardData.charts.map((chart: any, idx: number) => (
                  <div key={idx} className="glass p-6 rounded-xl border border-white/5">
                    <h3 className="text-lg font-semibold mb-6 text-white">{chart.title}</h3>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        {chart.type === 'bar' ? (
                          <BarChart data={chart.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey={chart.xKey} stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                            <Bar dataKey={chart.yKey} fill="#00d9ff" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        ) : chart.type === 'pie' ? (
                          <PieChart>
                            <Pie data={chart.data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey={chart.dataKey}>
                              {chart.data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                            <Legend />
                          </PieChart>
                        ) : chart.type === 'line' ? (
                          <RechartsLineChart data={chart.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey={chart.xKey} stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                            {chart.lines.map((line: string, i: number) => (
                              <Line key={i} type="monotone" dataKey={line} stroke={COLORS[i % COLORS.length]} strokeWidth={3} dot={false} />
                            ))}
                          </RechartsLineChart>
                        ) : <div />}
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && !dashboardData && (
             <div className="text-center mt-20 text-slate-400">
                <Database size={64} className="mx-auto mb-4 opacity-20" />
                <h2>No data analyzed yet. Please upload a dataset first.</h2>
             </div>
          )}

          {/* CHAT VIEW */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[85vh] max-w-4xl mx-auto glass rounded-xl overflow-hidden border border-white/5">
              <div className="p-4 border-b border-white/5 bg-slate-800/50 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><MessageSquare className="text-primary" /> Natural Language Analytics</h3>
                <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded border border-primary/30">AI Engine Active</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-slate-900 rounded-tr-none' : 'glass border border-white/5 text-slate-200 rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-white/5 bg-slate-800/30">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Ask AI to build a chart or analyze data..."
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary text-white"
                  />
                  <button onClick={handleChat} className="px-6 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:bg-primary/80 transition shadow-[0_0_15px_rgba(0,217,255,0.3)]">
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'insights' && (
             <div className="text-center mt-20">
                <Activity size={64} className="mx-auto mb-4 text-primary glow-text" />
                <h2 className="text-3xl font-bold text-white mb-2">AI Insight Engine</h2>
                <p className="text-slate-400 max-w-lg mx-auto">Upload a dataset to automatically generate business insights, detect anomalies, and uncover trends.</p>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}

const NavButton = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${active ? 'bg-primary/10 text-primary border border-primary/30 shadow-[inset_0_0_20px_rgba(0,217,255,0.1)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
  >
    {icon} <span className="font-medium">{label}</span>
  </button>
);

export default App;
