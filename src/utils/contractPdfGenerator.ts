import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ContractPdfData {
  // Contract details
  contractId: string;
  contractType: string;
  startDate: string;
  endDate: string;
  // Student details
  studentFirstName: string;
  studentLastName: string;
  parentFirstName: string;
  parentLastName: string;
  address: string;
  city: string;
  zip: string;
  email: string;
  phone: string;
  mobile: string;
  // Contract terms
  lessonDuration: number;
  minimumLessons: number;
  perLessonRate: number;
  registrationFee: number;
  paymentMode: string;
  // Banking (if applicable)
  bankInstitute?: string;
  iban?: string;
  // Signatures
  signatureUrl?: string;
  signedAt?: string;
  // Engagements
  engagements?: Array<{
    teacherName: string;
    subject: string;
    teacherRate: number;
  }>;
}

export const generateContractPdf = async (data: ContractPdfData): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  let yPosition = 20;

  // Add company header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CleverCoach - Tutoring Contract', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Höschenhofweg 31, 47249 Duisburg', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;
  doc.text('Phone: 0203 39652097 | Email: kontakt@clevercoach-nachhilfe.de', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Contract Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Contract Information', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const contractInfo = [
    ['Contract ID:', data.contractId],
    ['Contract Type:', data.contractType],
    ['Start Date:', data.startDate],
    ['End Date:', data.endDate || 'Ongoing'],
    ['Status:', data.signedAt ? 'Signed' : 'Pending Signature']
  ];

  autoTable(doc, {
    startY: yPosition,
    body: contractInfo,
    theme: 'grid',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 120 }
    },
    margin: { left: 20, right: 20 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Parent/Guardian Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Parent/Guardian Information', 20, yPosition);
  yPosition += 10;

  const parentInfo = [
    ['Name:', `${data.parentFirstName} ${data.parentLastName}`],
    ['Address:', data.address],
    ['City:', `${data.zip} ${data.city}`],
    ['Phone:', data.phone],
    ['Mobile:', data.mobile],
    ['Email:', data.email]
  ];

  autoTable(doc, {
    startY: yPosition,
    body: parentInfo,
    theme: 'grid',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 120 }
    },
    margin: { left: 20, right: 20 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Student Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Information', 20, yPosition);
  yPosition += 10;

  const studentInfo = [
    ['Student Name:', `${data.studentFirstName} ${data.studentLastName}`],
    ['Lesson Duration:', `${data.lessonDuration} minutes`],
    ['Minimum Lessons:', data.minimumLessons.toString()],
    ['Per Lesson Rate:', `€${data.perLessonRate}`],
    ['Registration Fee:', `€${data.registrationFee}`]
  ];

  autoTable(doc, {
    startY: yPosition,
    body: studentInfo,
    theme: 'grid',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 120 }
    },
    margin: { left: 20, right: 20 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Payment Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Information', 20, yPosition);
  yPosition += 10;

  const paymentInfo = [
    ['Payment Mode:', data.paymentMode]
  ];

  if (data.paymentMode === 'Lastschrift' && data.bankInstitute && data.iban) {
    paymentInfo.push(['Bank Institute:', data.bankInstitute]);
    paymentInfo.push(['IBAN:', data.iban]);
  }

  autoTable(doc, {
    startY: yPosition,
    body: paymentInfo,
    theme: 'grid',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 120 }
    },
    margin: { left: 20, right: 20 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Teacher Engagements Section
  if (data.engagements && data.engagements.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Teacher Engagements', 20, yPosition);
    yPosition += 10;

    const engagementData = data.engagements.map(engagement => [
      engagement.teacherName,
      engagement.subject,
      `€${engagement.teacherRate}`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Teacher', 'Subject', 'Rate per Lesson']],
      body: engagementData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [220, 220, 220] },
      margin: { left: 20, right: 20 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Signature Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Contract Signature', 20, yPosition);
  yPosition += 10;

  if (data.signedAt) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Signed on: ${data.signedAt}`, 20, yPosition);
    yPosition += 15;

    if (data.signatureUrl) {
      try {
        // Add signature image if available
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = data.signatureUrl;
        
        // Wait for image to load and add it to PDF
        await new Promise((resolve) => {
          img.onload = () => {
            const imgWidth = 80;
            const imgHeight = (img.height * imgWidth) / img.width;
            doc.addImage(img, 'PNG', 20, yPosition, imgWidth, imgHeight);
            resolve(void 0);
          };
          img.onerror = () => resolve(void 0);
        });
      } catch (error) {
        console.error('Error adding signature image:', error);
        doc.text('Signature: [Digital Signature Applied]', 20, yPosition);
      }
    }
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Signature: [Pending]', 20, yPosition);
  }

  yPosition += 40;

  // Terms and Conditions
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms and Conditions', 20, yPosition);
  yPosition += 10;

  const terms = [
    '1. The contract is valid for the specified duration and will auto-renew unless cancelled.',
    '2. Lessons must be scheduled and attended according to the agreed terms.',
    '3. Payment is due as per the specified payment mode.',
    '4. Cancellation requires 14 days notice.',
    '5. All terms are subject to CleverCoach\'s general terms and conditions.'
  ];

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  terms.forEach(term => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(term, 20, yPosition);
    yPosition += 6;
  });

  // Footer
  const finalY = Math.max(yPosition + 20, pageHeight - 20);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('This contract is digitally generated and legally binding.', pageWidth / 2, finalY, { align: 'center' });

  return doc.output('blob');
};
