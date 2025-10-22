-- Combined Seeds Migration
-- All seed data from adminclever_clever (1).sql in one file

-- Insert activity types (exact values from original)
INSERT INTO tbl_activities_types (fld_id, fld_activity_name, fld_status) VALUES
(1, 'Kunde', 'Active'),
(2, 'Lehrkraft', 'Active'),
(3, 'Kn n.e.', 'Active'),
(4, 'LK hat Kn n.e.', 'Active'),
(5, 'Kn wartet auf Anruf von LK', 'Active'),
(6, 'Sonstiges', 'Active');

-- Insert roles (exact values from original)
INSERT INTO tbl_roles (fld_id, fld_role, fld_edate, fld_status) VALUES
(1, 'Admin', '2024-03-07', 'Active'),
(2, 'Teacher', '2024-03-07', 'Active'),
(3, 'Student', '2024-03-07', 'Active');

-- Insert subjects (exact values from original)
INSERT INTO tbl_subjects (fld_id, fld_subject, fld_image, fld_status) VALUES
(1, 'Mathematik', 'Mathematics.png', 'Active'),
(2, 'Englisch', 'united-kingdom.png', 'Active'),
(3, 'Deutsch', 'germany.png', 'Active'),
(4, 'Französisch', 'france.png', 'Active'),
(5, 'Spanisch', 'spain.png', 'Active'),
(6, 'Latein', 'History.png', 'Active'),
(7, 'BWL', 'BA.png', 'Active'),
(8, 'Physik', 'physics.png', 'Active'),
(9, 'Chemie', 'chemistry.png', 'Active'),
(10, 'Biologie', 'Biology.png', 'Active'),
(11, 'Geschichte', 'Story.png', 'Active'),
(12, 'Geografie', 'Geography.png', 'Active'),
(13, 'Informatik', 'IT.png', 'Active'),
(14, 'Wirtschaft', 'business.jpeg', 'Active'),
(15, 'Recht', 'law.png', 'Active'),
(16, 'Philosophie', 'philosophy.png', 'Active'),
(17, 'Psychologie', 'Psychology.png', 'Active'),
(18, 'Kunst', 'art.png', 'Active'),
(19, 'Musik', 'music.png', 'Active'),
(20, 'Andere', 'Other.png', 'Active');

-- Insert educational backgrounds (exact values from original)
INSERT INTO tbl_educational (fld_id, fld_ename, fld_status) VALUES
(1, 'Fachhochschulreife', 'Active'),
(2, 'Abitur / Allgemeine Hochschulreife', 'Active'),
(3, 'Berufsausbildung (abgeschlossen)', 'Active'),
(4, 'Fachabitur', 'Active'),
(5, 'Bachelor ', 'Active'),
(6, 'Master', 'Active'),
(7, 'Diplom ', 'Active'),
(8, 'Promotion', 'Active'),
(9, 'Sonstige Abschlüsse (z.B. ausländische Abschlüsse)', 'Active');

-- Insert lesson durations (exact values from original)
INSERT INTO tbl_lesson_durations (fld_id, fld_l_duration) VALUES
(1, '45 min'),
(2, '60 min'),
(3, '90 min'),
(4, '120 min');

-- Insert levels (exact values from original)
INSERT INTO tbl_levels (fld_id, fld_level) VALUES
(1, 'bis Klasse 1'),
(2, 'bis Klasse 2'),
(3, 'bis Klasse 3'),
(4, 'bis Klasse 4'),
(5, 'bis Klasse 5'),
(6, 'bis Klasse 6'),
(7, 'bis Klasse 7'),
(8, 'bis Klasse 8'),
(9, 'bis Klasse 9'),
(10, 'bis Klasse 10'),
(11, 'bis Klasse 11'),
(12, 'bis Klasse 12'),
(13, 'bis Klasse 13'),
(14, 'Universität');

-- Insert mediation types (exact values from original)
INSERT INTO tbl_mediation_types (fld_id, fld_rid, fld_stage_name, fld_status) VALUES
(1, 1, 'Mediated', 'Inactive'),
(2, 2, 'Nicht erreicht 1x', 'Active'),
(3, 2, 'Nicht erreicht 2x', 'Active'),
(4, 2, 'WhatsApp gesendet', 'Active'),
(5, 2, 'In Kontakt/ Terminfindung', 'Active'),
(6, 2, 'Probestunde hat stattgefunden', 'Active'),
(7, 2, 'Reject', 'Inactive'),
(8, 1, 'IM Open', 'Inactive'),
(9, 1, 'N.E. 1x', 'Active'),
(10, 1, 'N.E. 2x', 'Active'),
(11, 1, 'WhatsApp gesendet', 'Active'),
(12, 1, 'IM Confirmed', 'Inactive'),
(13, 1, 'Vertrag ges.', 'Active'),
(14, 1, 'Bedenkzeit', 'Active'),
(15, 1, 'PS RG', 'Active'),
(16, 1, '1.⁠ ⁠des Monats ', 'Active'),
(17, 1, '2.⁠ ⁠des Monats ', 'Active'),
(18, 1, '3.⁠ ⁠des Monats ', 'Active'),
(19, 1, '4.⁠ ⁠des Monats ', 'Active'),
(21, 1, '5.⁠ ⁠des Monats ', 'Active'),
(22, 1, '6.⁠ ⁠des Monats ', 'Active'),
(23, 1, '7.⁠ ⁠des Monats ', 'Active'),
(24, 1, '8.⁠ ⁠des Monats ', 'Active'),
(25, 1, '9.⁠ ⁠des Monats ', 'Active'),
(26, 1, '10.⁠ ⁠des Monats ', 'Active'),
(27, 1, '11.⁠ ⁠des Monats ', 'Active'),
(28, 1, '12.⁠ ⁠des Monats ', 'Active'),
(29, 1, '13.⁠ ⁠des Monats ', 'Active'),
(30, 1, '14.⁠ ⁠des Monats ', 'Active'),
(31, 1, '15.⁠ ⁠des Monats ', 'Active'),
(32, 1, '16.⁠ ⁠des Monats ', 'Active'),
(33, 1, '17.⁠ ⁠des Monats ', 'Active'),
(34, 1, '18.⁠ ⁠des Monats ', 'Active'),
(35, 1, '19.⁠ ⁠des Monats ', 'Active'),
(36, 1, '20.⁠ ⁠des Monats ', 'Active'),
(37, 1, '21.⁠ ⁠des Monats ', 'Active'),
(38, 1, '22.⁠ ⁠des Monats ', 'Active'),
(39, 1, '23.⁠ ⁠des Monats ', 'Active'),
(40, 1, '24.⁠ ⁠des Monats ', 'Active'),
(41, 1, '25.⁠ ⁠des Monats ', 'Active'),
(42, 1, '26.⁠ ⁠des Monats ', 'Active'),
(43, 1, '27.⁠ ⁠des Monats ', 'Active'),
(44, 1, '28.⁠ ⁠des Monats ', 'Active'),
(45, 1, '29.⁠ ⁠des Monats ', 'Active'),
(46, 1, '30.⁠ ⁠des Monats ', 'Active'),
(47, 1, '31.⁠ ⁠des Monats ', 'Active'),
(48, 2, '1.⁠ ⁠des Monats ', 'Active'),
(49, 2, '2.⁠ ⁠des Monats ', 'Active'),
(50, 2, '3.⁠ ⁠des Monats ', 'Active'),
(51, 2, '4.⁠ ⁠des Monats ', 'Active'),
(53, 2, '5.⁠ ⁠des Monats ', 'Active'),
(54, 2, '6.⁠ ⁠des Monats ', 'Active'),
(55, 2, '7.⁠ ⁠des Monats ', 'Active'),
(56, 2, '8.⁠ ⁠des Monats ', 'Active'),
(57, 2, '9.⁠ ⁠des Monats ', 'Active'),
(58, 2, '10.⁠ ⁠des Monats ', 'Active'),
(59, 2, '11.⁠ ⁠des Monats ', 'Active'),
(60, 2, '12.⁠ ⁠des Monats ', 'Active'),
(61, 2, '13.⁠ ⁠des Monats ', 'Active'),
(62, 2, '14.⁠ ⁠des Monats ', 'Active'),
(63, 2, '15.⁠ ⁠des Monats ', 'Active'),
(64, 2, '16.⁠ ⁠des Monats ', 'Active'),
(65, 2, '17.⁠ ⁠des Monats ', 'Active'),
(66, 2, '18.⁠ ⁠des Monats ', 'Active'),
(67, 1, '19.⁠ ⁠des Monats ', 'Active'),
(68, 2, '19.⁠ ⁠des Monats ', 'Active'),
(69, 2, '20.⁠ ⁠des Monats ', 'Active'),
(70, 2, '21.⁠ ⁠des Monats ', 'Active'),
(71, 2, '22.⁠ ⁠des Monats ', 'Active'),
(72, 2, '23.⁠ ⁠des Monats ', 'Active'),
(73, 2, '24.⁠ ⁠des Monats ', 'Active'),
(74, 2, '25.⁠ ⁠des Monats ', 'Active'),
(75, 2, '26.⁠ ⁠des Monats ', 'Active'),
(76, 2, '27.⁠ ⁠des Monats ', 'Active'),
(77, 2, '28.⁠ ⁠des Monats ', 'Active'),
(78, 2, '29.⁠ ⁠des Monats ', 'Active'),
(79, 2, '30.⁠ ⁠des Monats ', 'Active'),
(80, 2, '31.⁠ ⁠des Monats ', 'Active');

-- Insert source types (exact values from original)
INSERT INTO tbl_source (fld_id, fld_type, fld_source, fld_status) VALUES
(1, 'Teacher', 'Flyer', 'Active'),
(2, 'Teacher', 'Facebook', 'Active'),
(3, 'Teacher', 'Instagram', 'Active'),
(4, 'Teacher', 'Tiktok', 'Active'),
(5, 'Teacher', 'Kleinanzeigen', 'Active'),
(6, 'Teacher', 'Weiterempfehlungen', 'Active'),
(7, 'Teacher', 'LinkedIn', 'Active'),
(8, 'Teacher', 'Xing', 'Active'),
(9, 'Teacher', 'Indeed', 'Active'),
(10, 'Teacher', 'Stellenwerk', 'Active'),
(11, 'Teacher', 'Meinestadtandere ', 'Active'),
(12, 'Student', 'Flyer', 'Active'),
(13, 'Student', 'Facebook', 'Active'),
(14, 'Student', 'Instagram', 'Active'),
(15, 'Student', 'Bark', 'Active'),
(16, 'Student', 'Kleinanzeigen', 'Active'),
(17, 'Student', 'Weiterempfehlungen', 'Active');

-- Insert delete reasons (exact values from original)
INSERT INTO tbl_delete_reasons (fld_id, fld_reason, fld_type, fld_status) VALUES
(1, 'Noten verbessert', 'Student', 'Active'),
(2, 'Preis', 'Student', 'Active'),
(3, 'Anderes Institut', 'Student', 'Active'),
(4, 'Service', 'Student', 'Active'),
(5, 'Qualität', 'Student', 'Active'),
(6, 'Lebensumstände', 'Student', 'Active'),
(7, 'Kurzfristig genutzt', 'Student', 'Active'),
(8, 'Keine Lehrkraft', 'Student', 'Active'),
(9, 'Sonstige', 'Student', 'Active'),
(10, 'Nur Preisauskunft', 'Student', 'Active'),
(11, 'Kn. nicht erreichbar', 'Student', 'Active'),
(12, 'Lebensumstände', 'Teacher', 'Active'),
(13, 'Bezahlung', 'Teacher', 'Active'),
(14, 'Anderes Institut', 'Teacher', 'Active'),
(15, 'Kein Interesse mehr', 'Teacher', 'Active'),
(16, 'LK nicht erreichbar', 'Teacher', 'Active'),
(17, 'Sonstige', 'Teacher', 'Active'),
(18, 'Zu wenig Schüler', 'Teacher', 'Active'),
(19, 'Service', 'Teacher', 'Active');

-- Update sequences to match the exact values
SELECT setval('tbl_activities_types_fld_id_seq', 6);
SELECT setval('tbl_roles_fld_id_seq', 3);
SELECT setval('tbl_subjects_fld_id_seq', 20);
SELECT setval('tbl_educational_fld_id_seq', 9);
SELECT setval('tbl_lesson_durations_fld_id_seq', 4);
SELECT setval('tbl_levels_fld_id_seq', 14);
SELECT setval('tbl_mediation_types_fld_id_seq', 80);
SELECT setval('tbl_source_fld_id_seq', 17);
SELECT setval('tbl_delete_reasons_fld_id_seq', 19);
