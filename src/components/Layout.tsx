import { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { TransactionsList } from '@/components/TransactionsList';
import { SpendingGoalsForm } from '@/components/SpendingGoalsForm';
import { TransactionForm } from '@/components/TransactionForm';
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <Tabs defaultValue="dashboard" className="flex-1 flex flex-col">
          <div className="border-b">
            <div className="px-4">
              <TabsList className="mt-1">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="transactions">Transações</TabsTrigger>
                <TabsTrigger value="goals">Metas</TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="dashboard" className="flex-1">
            <Dashboard />
          </TabsContent>
          
          <TabsContent value="transactions" className="flex-1">
            <TransactionsList />
          </TabsContent>
          
          <TabsContent value="goals" className="flex-1">
            <SpendingGoalsForm />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Transaction Form - fixed button */}
      <TransactionForm />
    </div>
  );
}
