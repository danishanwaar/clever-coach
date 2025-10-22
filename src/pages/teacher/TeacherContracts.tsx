import { TeacherContractPortal } from '@/components/teacher/TeacherContractPortal';

const TeacherContracts = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Contracts</h1>
        <p className="text-muted-foreground">
          View and manage your teaching contracts and engagements
        </p>
      </div>
      <TeacherContractPortal />
    </div>
  );
};

export default TeacherContracts;