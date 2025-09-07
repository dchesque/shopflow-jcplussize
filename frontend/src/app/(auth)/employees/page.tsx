'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, Download, UserPlus } from 'lucide-react'
import { EmployeeTable } from '@/components/dashboard/EmployeeTable'
import { EmployeeForm } from '@/components/dashboard/EmployeeForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useEmployees } from '@/hooks/useEmployees'

export default function EmployeesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'inactive'>('all')

  const { 
    employees, 
    isLoading, 
    error, 
    totalCount, 
    activeCount, 
    inactiveCount 
  } = useEmployees({
    search: searchTerm,
    status: filterBy === 'all' ? undefined : filterBy,
    page: 1,
    limit: 50
  })

  const handleEmployeeCreated = () => {
    setIsFormOpen(false)
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Erro ao carregar funcionários: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Gerenciamento de Funcionários
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie funcionários, perfis de acesso e dados pessoais conforme LGPD
          </p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Funcionário</DialogTitle>
            </DialogHeader>
            <EmployeeForm onSuccess={handleEmployeeCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
            <Badge variant="secondary">{totalCount || 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount || 0}</div>
            <p className="text-xs text-gray-600">funcionários cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários Ativos</CardTitle>
            <Badge variant="default" className="bg-green-100 text-green-800">
              {activeCount || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount || 0}</div>
            <p className="text-xs text-gray-600">em atividade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários Inativos</CardTitle>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              {inactiveCount || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{inactiveCount || 0}</div>
            <p className="text-xs text-gray-600">inativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros e Busca</CardTitle>
          <CardDescription>
            Use os filtros abaixo para encontrar funcionários específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterBy === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilterBy('all')}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={filterBy === 'active' ? 'primary' : 'outline'}
                onClick={() => setFilterBy('active')}
                size="sm"
              >
                Ativos
              </Button>
              <Button
                variant={filterBy === 'inactive' ? 'primary' : 'outline'}
                onClick={() => setFilterBy('inactive')}
                size="sm"
              >
                Inativos
              </Button>
            </div>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lista de Funcionários</CardTitle>
          <CardDescription>
            Gerencie informações de funcionários com conformidade LGPD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeTable
            employees={employees || []}
            isLoading={isLoading}
            onRefresh={() => window.location.reload()}
          />
        </CardContent>
      </Card>
    </div>
  )
}