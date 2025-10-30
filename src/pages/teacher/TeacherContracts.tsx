import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, User, FileText, Euro, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTeacher } from '@/hooks/useTeacherProfile';
import {
  useTeacherActiveContracts,
  useTeacherInactiveContracts
} from '@/hooks/useTeacherProfile';

const TeacherContracts: React.FC = () => {
  const { user } = useAuthStore();
  const { data: teacher } = useTeacher(user?.fld_id);
  const teacherId = teacher?.fld_id;
  // Fetch active contracts
  const { data: activeEngagements = [], isLoading: activeLoading } = useTeacherActiveContracts(teacherId);

  // Fetch inactive contracts
  const { data: inactiveEngagements = [], isLoading: inactiveLoading } = useTeacherInactiveContracts(teacherId);

  if (!teacherId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">Loading teacher information...</p>
        </div>
      </div>
    );
  }

  if (activeLoading || inactiveLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Contracts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-primary">Aktive Verträge</h3>
          </div>
          <Badge variant="secondary" className="text-sm">
            {activeEngagements.length}
          </Badge>
        </div>
        {activeEngagements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeEngagements.map((engagement) => (
              <Card key={engagement.fld_id} className="border border-green-200 bg-green-50/30 hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                            Vertrag #{engagement.fld_cid}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Euro className="h-4 w-4" />
                            <span className="font-semibold">{Math.round(engagement.fld_t_per_lesson_rate)}/Einheit</span>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                          Aktiv
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mt-3 pt-3 border-t border-green-200">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="font-medium text-gray-900">{engagement.student_name}</span>
                        </div>
                        {engagement.subject && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-gray-600">{engagement.subject}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Keine aktiven Verträge gefunden</h4>
              <p className="text-sm text-gray-500">
                Sie haben derzeit keine aktiven Verträge.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Inactive Contracts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-primary">Inaktive Verträge</h3>
          </div>
          <Badge variant="secondary" className="text-sm">
            {inactiveEngagements.length}
          </Badge>
        </div>
        {inactiveEngagements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inactiveEngagements.map((engagement) => (
              <Card key={engagement.fld_id} className="border border-gray-200 bg-gray-50/50 hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                            Vertrag #{engagement.fld_cid}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Euro className="h-4 w-4" />
                            <span className="font-semibold">{Math.round(engagement.fld_t_per_lesson_rate)}/Einheit</span>
                          </div>
                        </div>
                        <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                          Inaktiv
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="font-medium text-gray-900">{engagement.student_name}</span>
                        </div>
                        {engagement.subject && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-gray-600">{engagement.subject}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-600">
                            Monatlich {Math.round(engagement.contract_min_lesson)} Pflicht-Einheiten
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Keine inaktiven Verträge gefunden</h4>
              <p className="text-sm text-gray-500">
                Sie haben derzeit keine inaktiven Verträge.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeacherContracts;
