import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuthStore } from "@/stores/authStore";
import { useTeacherDashboard } from "@/hooks/useTeacherDashboard";
import { Loader } from "@/components/ui/loader";
import { StatusUpdateDialog } from "@/components/teacher/StatusUpdateDialog";
import {
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
  Phone,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen,
  User,
  Calendar,
  DollarSign,
  Info,
  Settings,
  Award,
} from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const [openSections, setOpenSections] = useState<Set<number>>(new Set());
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<{
    studentName: string;
    teacherId: number;
    studentId: number;
    studentSubjectId: number;
  } | null>(null);

  const { teacher, stats, meetings, introductoryMeetings, isLoading } = useTeacherDashboard(user?.fld_id);

  const toggleSection = (sectionId: number) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleStatusClick = (meeting: any) => {
    setSelectedMeeting({
      studentName: `${meeting.fld_sal} ${meeting.fld_first_name} ${meeting.fld_last_name}`,
      teacherId: teacher.data?.fld_id || 0,
      studentId: meeting.fld_sid,
      studentSubjectId: meeting.fld_ssid,
    });
    setStatusDialogOpen(true);
  };

  if (isLoading) {
    return <Loader message="Loading teacher dashboard..." />;
  }

  if (!teacher.data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Teacher Not Found</h2>
          <p className="text-gray-600">Unable to load teacher information.</p>
        </div>
      </div>
    );
  }

  // Show approval pending message for non-hired teachers
  if (teacher.data.fld_status !== "Hired") {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800 text-lg">Welcome to Clever Coach, {user?.fld_name}!</h3>
                <p className="text-yellow-700">Your registration form is under approval process!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onboardingSections = [
    {
      id: 0,
      title: "🔄 Ablauf",
      content: (
        <ul className="space-y-2 text-sm">
          <li>• Wir melden uns telefonisch oder per WhatsApp, wenn wir einen passenden Schüler für dich haben</li>
          <li>
            • Du hast Kapazität und stimmst zu? → Du bekommst die Kontaktdaten per Mail (auch im Portal sichtbar).
          </li>
          <li>• Bitte schnell anrufen, um einen positiven Eindruck zu hinterlassen.</li>
          <li>• Falls du die Familie nicht erreichst: kurze WhatsApp mit freundlicher Vorstellung schicken.</li>
          <li>
            • <strong>Wichtig:</strong> Wir stehen im Wettbewerb mit anderen Anbietern – zügiger Kontakt erhöht die
            Erfolgschancen für euch und uns.
          </li>
        </ul>
      ),
    },
    {
      id: 1,
      title: "✅ Statuspflege im Portal",
      content: (
        <ul className="space-y-2 text-sm">
          <li>• ⬇️ Statusanpassungen kannst du unter dem Onboarding Panel hier tätigen ⬇️</li>
          <li>
            • Ihr seid in Kontakt, aber es gibt noch keinen Termin für die Probestunde? → Status: „in Kontakt/
            Terminfindung"
          </li>
          <li>
            • Ein Termin für die Probestunde steht fest? → Datum im Statusfeld eintragen (zwischen dem 1. und 31. des
            Monats).
          </li>
          <li>
            • Nach der Probestunde unverzüglich für alle Fächer den Status zu "Probestunde hat stattgefunden" anpassen.
          </li>
          <li>• Datum der Probestunde im Feld eintragen – meist 60 Minuten (Abweichungen sagen wir dir).</li>
        </ul>
      ),
    },
    {
      id: 2,
      title: "🚫 Wenn es nicht passt",
      content: (
        <ul className="space-y-2 text-sm">
          <li>• Keine Probestunde vereinbaren!</li>
          <li>• Gib uns Bescheid – wir übernehmen.</li>
          <li>• Der Familie sagst du professionell, dass du nochmal Rücksprache hältst (keine Details).</li>
        </ul>
      ),
    },
    {
      id: 3,
      title: "📆 Nach Vertragsabschluss – Auszahlung deines Honorars",
      content: (
        <ul className="space-y-2 text-sm">
          <li>• Schüler erscheint im Portal im Bereich Profil unter „Stundenübersicht".</li>
          <li>
            • ↖️ Oben links gelangst du zu deinem Profil. Von dort zur Stundenübersicht (auf dem Handy drei Striche)
          </li>
          <li>• Alle tatsächlich durchgeführten Stunden bis Monatsende eintragen.</li>
          <li>
            • ❗ <strong>Keine Voreinträge!</strong>
          </li>
          <li>• 1 Einheit = 60 Minuten (45/90 Min. nur nach Info von uns).</li>
        </ul>
      ),
    },
    {
      id: 4,
      title: "🧾 Mindeststunden & Absagen",
      content: (
        <ul className="space-y-2 text-sm">
          <li>• In der Regel 4 Einheiten pro Monat – Abweichungen teilen wir mit.</li>
          <li>• Du gibst nur deine Stunden ein – nicht verantwortlich für Erfüllung.</li>
          <li>• Bei Absagen: immer Nachholtermin anbieten.</li>
          <li>• Bei Nichterfüllung: kurze WhatsApp – ggf. Übertrag in Folgemonat.</li>
        </ul>
      ),
    },
    {
      id: 5,
      title: "🏖️ Urlaub & Abwesenheit",
      content: (
        <ul className="space-y-2 text-sm">
          <li>• Frühzeitig Bescheid sagen – wir organisieren ggf. Vertretung.</li>
        </ul>
      ),
    },
    {
      id: 6,
      title: "❗ Wenn Familien Fragen haben",
      content: (
        <ul className="space-y-2 text-sm">
          <li>• Bei Fragen zu Verträgen, Preisen, Ferienregelung etc. → immer ans Büro verweisen.</li>
          <li>• Alles, was du nicht sicher weißt, direkt an uns weitergeben.</li>
        </ul>
      ),
    },
    {
      id: 7,
      title: "⚠️ Bei Problemen oder Unstimmigkeiten",
      content: (
        <ul className="space-y-2 text-sm">
          <li>
            • <strong>Nicht selbst reagieren!</strong> Immer uns informieren.
          </li>
          <li>• Wir finden gemeinsam eine Lösung – jederzeit erreichbar.</li>
        </ul>
      ),
    },
    {
      id: 8,
      title: "📝 Vervollständigen des Profils",
      content: (
        <ul className="space-y-2 text-sm">
          <li>
            • Unter <strong>Profil → Einstellungen</strong> deine Bankdaten und Steuernummer eintragen.
          </li>
          <li>
            • Unter <strong>Profil → Dokumente</strong> alle Nachweise hochladen (Qualifikationen, Zeugnisse,
            Zertifikate).
          </li>
          <li>
            • <strong>Nur wenn alles vollständig hochgeladen ist, wirst du freigeschaltet</strong> und bei neuen
            Schüleranfragen berücksichtigt.
          </li>
        </ul>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Teacher Dashboard</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Welcome back, {user?.fld_name}! Here's what's happening with your students.
            </p>
          </div>
          <Badge variant="secondary" className="text-sm w-fit">
            Teacher
          </Badge>
        </div>
      </div>

      {/* Statistics Cards - Modern White Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:scale-105 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">My Students</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stats.data?.totalStudents || 0}</p>
                <div className="text-sm text-gray-500 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Currently assigned
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:scale-105 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Contracts</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stats.data?.totalContracts || 0}</p>
                <div className="text-sm text-gray-500 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Currently active
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Student Meetings */}
      {meetings.data && meetings.data.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Pending Student Meetings</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {meetings.data.map((meeting) => (
              <Card
                key={`${meeting.fld_sid}-${meeting.fld_ssid}`}
                className="bg-white border border-blue-200 hover:shadow-lg hover:shadow-blue-200/50 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-base">
                          Anstehender Kennenlern-Termin für {meeting.fld_subject}
                        </h4>
                        <Badge variant="destructive" className="text-xs ml-2">
                          {meeting.fld_stage_name}
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">
                        Du hast einen anstehenden Kennenlern-Termin mit{" "}
                        <strong className="text-gray-900">
                          {meeting.fld_sal} {meeting.fld_first_name} {meeting.fld_last_name}
                        </strong>
                        . Bitte rufe Ihn/ Sie unter dieser Kontaktnummer an:{" "}
                        <strong className="text-gray-900">{meeting.fld_mobile}</strong>.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          onClick={() => window.open(`tel:${meeting.fld_mobile}`, '_self')}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-300 hover:bg-green-50"
                          onClick={() => window.open(`https://wa.me/${meeting.fld_mobile.replace(/[^0-9]/g, '')}`, '_blank')}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-primary hover:bg-primary/90 text-white"
                          onClick={() => handleStatusClick(meeting)}
                        >
                          Status eintragen →
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Introductory Meetings */}
      {introductoryMeetings.data && introductoryMeetings.data.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Introductory Meeting Confirmations</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {introductoryMeetings.data.map((meeting) => (
              <Card
                key={meeting.fld_id}
                className="bg-white border border-green-200 hover:shadow-lg hover:shadow-green-200/50 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-base">
                          Introductory Meeting - {meeting.fld_subject}
                        </h4>
                        <Badge variant="default" className="bg-green-600 text-white text-xs ml-2">
                          Confirmed
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">
                        You have confirmed an introductory meeting with{" "}
                        <strong className="text-gray-900">
                          {meeting.fld_first_name} {meeting.fld_last_name}
                        </strong>
                        . Contact: <strong className="text-gray-900">{meeting.fld_mobile}</strong>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-50">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No pending meetings message */}
      {meetings.data &&
        meetings.data.length === 0 &&
        introductoryMeetings.data &&
        introductoryMeetings.data.length === 0 && (
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Meetings</h3>
              <p className="text-gray-600">You don't have any pending student meetings at the moment.</p>
            </CardContent>
          </Card>
        )}

      {/* Onboarding Panel */}
      <Card className="bg-white border border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
        <CardHeader className="border-b border-primary/20 bg-primary/5">
          <CardTitle className="text-lg font-semibold text-primary flex items-center">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <Info className="h-5 w-5 text-white" />
            </div>
            Onboarding Panel
          </CardTitle>
          <CardDescription className="text-gray-600">Important information and guidelines for teachers</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {onboardingSections.map((section) => (
              <Collapsible
                key={section.id}
                open={openSections.has(section.id)}
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-primary/5 hover:bg-primary/10 border-primary/30 hover:border-primary text-primary hover:text-primary font-medium transition-all duration-200 group"
                  >
                    <span className="font-medium">{section.title}</span>
                    {openSections.has(section.id) ? (
                      <ChevronUp className="h-4 w-4 text-primary transition-colors" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-primary transition-colors" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg text-gray-700">
                    {section.content}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      {selectedMeeting && (
        <StatusUpdateDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          studentName={selectedMeeting.studentName}
          teacherId={selectedMeeting.teacherId}
          studentId={selectedMeeting.studentId}
          studentSubjectId={selectedMeeting.studentSubjectId}
        />
      )}
    </div>
  );
}
