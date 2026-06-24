import React from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import type { Announcement, Aduan, Fact, Rumor, ChatMessage, LedgerTransaction, FamilyMember, Household } from './types';

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

import './index.css';

export function App() {
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

  if (!currentUser) {
    return (
      <LoginView
        onLoginWarga={handleLoginWarga}
        onLoginAdmin={handleLoginAdmin}
        onRegisterWarga={handleRegisterWarga}
      />
    );
  }

  return (
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
  );
}

export default App;
