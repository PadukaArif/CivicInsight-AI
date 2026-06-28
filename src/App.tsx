import React from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
// Import komponen-komponen view yang sudah modular
import { BerandaView } from './components/views/BerandaView';
import { KonsultasiAIView } from './components/views/KonsultasiAIView';
import { CekFaktaView } from './components/views/CekFaktaView';
import { LaporAduanView } from './components/views/LaporAduanView';
import { PengaturanView } from './components/views/PengaturanView';
import { StatistikView } from './components/views/StatistikView';
import { EvaluasiAIView } from './components/views/EvaluasiAIView';
import { LoginView } from './components/views/LoginView';
import { useCivicData } from './hooks/useCivicData';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

import './index.css';

export function App() {
  const [toast, setToast] = React.useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

  React.useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message?: any) => {
      const msgText = message !== undefined && message !== null ? String(message) : '';
      let type: 'info' | 'success' | 'error' = 'success';
      const msgLower = msgText.toLowerCase();
      if (
        msgLower.includes('gagal') ||
        msgLower.includes('salah') ||
        msgLower.includes('besar') ||
        msgLower.includes('harap') ||
        msgLower.includes('belum') ||
        msgLower.includes('yakin') ||
        msgLower.includes('tolak')
      ) {
        type = 'error';
      } else if (
        msgLower.includes('berhasil') ||
        msgLower.includes('sukses') ||
        msgLower.includes('selesai') ||
        msgLower.includes('apresiasi')
      ) {
        type = 'success';
      } else {
        type = 'info';
      }
      setToast({ message, type });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const {
    adminCredentials,
    approvedUsers,
    pendingRegistrations,
    currentUser,
    isAdmin,
    quizQuestions,
    pointsPerQuestion,
    activeRtRw,
    setActiveRtRw,
    currentTab,
    setCurrentTab,
    pollResults,
    userVoted,
    evalMessages,
    isEvalTyping,
    totalWarga,
    kasRT,
    poinWarga,
    jamSampah,
    jamOperasional,
    emergencyContacts,
    announcements,
    chatMessages,
    isTyping,
    verifiedFacts,
    submittedRumors,
    aduanList,
    kasLedger,
    households,
    handleLoginWarga,
    handleLoginAdmin,
    handleRegisterWarga,
    handleApproveRegistration,
    handleRejectRegistration,
    handleUpdateCitizenPoints,
    handleAddQuizQuestion,
    handleDeleteQuizQuestion,
    handleUpdatePointsPerQuestion,
    handleUpdateAdminCredentials,
    handleLogout,
    handleToggleRole,
    handleUpdateStats,
    handleUpdateSchedules,
    handleAddAnnouncement,
    handleDeleteAnnouncement,
    handleSendChatMessage,
    handleSubmitRumor,
    handleVerifyRumor,
    handleDeleteRumor,
    handleAddFact,
    handleDeleteFact,
    handleSendEvalMessage,
    handleSubmitAduan,
    handleUpdateAduanStatus,
    handleDeleteAduan,
    handleAddFamilyMember,
    handleDeleteFamilyMember,
    handleEditAnnouncement,
    handleAddContact,
    handleEditContact,
    handleDeleteContact,
    handleAddTransaction,
    handleEditTransaction,
    handleDeleteTransaction,
    handleEditFact,
    handleEditFamilyMember,
    handleEditHouseholdKk,
    handleVoteComfort,
    handleDeleteCitizen,
    handleAddHousehold,
    handleDeleteHousehold,
    handleResetAllData,
  } = useCivicData();

  // ======================== ROUTER SWITCH MODUL VIEW ========================
  const renderActiveView = () => {
    switch (currentTab) {
      case 'beranda':
        return (
          <BerandaView
            isAdmin={isAdmin}
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onEditAnnouncement={handleEditAnnouncement}
            activeRtRw={activeRtRw}
            totalWarga={totalWarga}
            kasRT={kasRT}
            poinWarga={poinWarga}
            onUpdateStats={handleUpdateStats}
            kasLedger={kasLedger}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            emergencyContacts={emergencyContacts}
            onAddContact={handleAddContact}
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
            jamSampah={jamSampah}
            jamOperasional={jamOperasional}
            onUpdateSchedules={handleUpdateSchedules}
            pollResults={pollResults}
            userVoted={userVoted}
            onVoteComfort={handleVoteComfort}
            currentUser={currentUser}
            quizQuestions={quizQuestions}
            pointsPerQuestion={pointsPerQuestion}
            onAddQuizQuestion={handleAddQuizQuestion}
            onDeleteQuizQuestion={handleDeleteQuizQuestion}
            onUpdatePointsPerQuestion={handleUpdatePointsPerQuestion}
            onUpdateCitizenPoints={handleUpdateCitizenPoints}
          />
        );
      
      case 'konsultasi-ai':
        return (
          <KonsultasiAIView
            chatMessages={chatMessages}
            onSendChatMessage={handleSendChatMessage}
            isTyping={isTyping}
          />
        );

      case 'evaluasi-ai':
        return (
          <EvaluasiAIView
            chatMessages={evalMessages}
            onSendChatMessage={handleSendEvalMessage}
            isTyping={isEvalTyping}
          />
        );

      case 'statistik':
        return (
          <StatistikView
            households={households}
            pollResults={pollResults}
            userVoted={userVoted}
            onVoteComfort={handleVoteComfort}
            aduanList={aduanList}
            poinWarga={poinWarga}
            approvedUsers={approvedUsers}
          />
        );
      
      case 'cek-fakta':
      case 'kelola-cek-fakta':
        return (
          <CekFaktaView
            isAdmin={isAdmin}
            verifiedFacts={verifiedFacts}
            submittedRumors={submittedRumors}
            onSubmitRumor={handleSubmitRumor}
            onVerifyRumor={handleVerifyRumor}
            onDeleteRumor={handleDeleteRumor}
            onAddFact={handleAddFact}
            onDeleteFact={handleDeleteFact}
            onEditFact={handleEditFact}
          />
        );
      
      case 'lapor-aduan':
      case 'kelola-aduan':
        return (
          <LaporAduanView
            isAdmin={isAdmin}
            currentUser={currentUser}
            aduanList={aduanList}
            onSubmitAduan={handleSubmitAduan}
            onUpdateAduanStatus={handleUpdateAduanStatus}
            onDeleteAduan={handleDeleteAduan}
          />
        );
      
      case 'pengaturan':
        return (
          <PengaturanView
            isAdmin={isAdmin}
            onToggleRole={handleToggleRole}
            onLogout={handleLogout}
            activeRtRw={activeRtRw}
            onRtRwChange={setActiveRtRw}
            households={households}
            onAddFamilyMember={handleAddFamilyMember}
            onDeleteFamilyMember={handleDeleteFamilyMember}
            onEditFamilyMember={handleEditFamilyMember}
            onEditHouseholdKk={handleEditHouseholdKk}
            pendingRegistrations={pendingRegistrations}
            onApproveRegistration={handleApproveRegistration}
            onRejectRegistration={handleRejectRegistration}
            adminCredentials={adminCredentials}
            onUpdateAdminCredentials={handleUpdateAdminCredentials}
            approvedUsers={approvedUsers}
            onUpdateCitizenPoints={handleUpdateCitizenPoints}
            currentUser={currentUser}
            onDeleteCitizen={handleDeleteCitizen}
            onAddHousehold={handleAddHousehold}
            onDeleteHousehold={handleDeleteHousehold}
            onResetAllData={handleResetAllData}
          />
        );
      
      default:
        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center">
            <h3 className="font-bold text-slate-800 text-lg">Modul Tidak Ditemukan</h3>
            <button 
              onClick={() => setCurrentTab('beranda')} 
              className="mt-4 bg-civic-primary text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        );
    }
  };

  const renderToast = () => {
    if (!toast) return null;
    return (
      <div className="fixed top-4 right-4 z-[9999] animate-fade-in max-w-sm w-[calc(100%-2rem)] bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg rounded-2xl p-4 flex items-start gap-3 select-none">
        {toast.type === 'success' && (
          <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 size={18} />
          </div>
        )}
        {toast.type === 'error' && (
          <div className="p-1 rounded-lg bg-rose-50 text-rose-600 shrink-0">
            <AlertCircle size={18} />
          </div>
        )}
        {toast.type === 'info' && (
          <div className="p-1 rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <Info size={18} />
          </div>
        )}
        <div className="flex-1">
          <p className={`text-xs font-bold ${
            toast.type === 'success' ? 'text-emerald-950' : toast.type === 'error' ? 'text-rose-950' : 'text-slate-900'
          }`}>
            {toast.type === 'success' ? 'Berhasil' : toast.type === 'error' ? 'Pemberitahuan' : 'Informasi'}
          </p>
          <p className="text-[11px] text-slate-650 font-semibold leading-relaxed mt-0.5">{toast.message}</p>
        </div>
        <button 
          onClick={() => setToast(null)} 
          className="text-slate-400 hover:text-slate-650 p-0.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <>
        <LoginView
          onLoginWarga={handleLoginWarga}
          onLoginAdmin={handleLoginAdmin}
          onRegisterWarga={handleRegisterWarga}
        />
        {renderToast()}
      </>
    );
  }

  return (
    <>
      <DashboardLayout
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isAdmin={isAdmin}
        activeRtRw={activeRtRw}
        onRtRwChange={setActiveRtRw}
        onLogout={handleLogout}
      >
        {renderActiveView()}
      </DashboardLayout>
      {renderToast()}
    </>
  );
}

export default App;
