PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE `absensi` (
	`id` text PRIMARY KEY NOT NULL,
	`tanggal` text NOT NULL,
	`siswa_id` text,
	`kelas_id` text,
	`mata_pelajaran` text,
	`status` text DEFAULT 'Hadir' NOT NULL,
	`keterangan` text,
	`user_id` text,
	FOREIGN KEY (`siswa_id`) REFERENCES `data_siswa`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`kelas_id`) REFERENCES `data_kelas`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a01','2026-07-27','s1','k1','Matematika','Hadir','','u-demo');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a02','2026-07-27','s2','k1','Matematika','Hadir','','u-demo');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a03','2026-07-27','s3','k1','Matematika','Sakit','Demam','u-demo');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a04','2026-07-27','s4','k1','Matematika','Hadir','','u-demo');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a05','2026-07-27','s5','k1','Matematika','Izin','Acara keluarga','u-demo');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a06','2026-07-27','s6','k1','Matematika','Hadir','','u-demo');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a07','2026-07-27','s7','k1','Matematika','Alpha','Tanpa keterangan','u-demo');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a08','2026-07-27','s8','k1','Matematika','Hadir','','u-demo');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a09','2026-07-28','s1','k1','Biologi','Hadir','','u-demo');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a10','2026-07-28','s2','k1','Biologi','Hadir','','u-demo');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a11','2026-07-28','s3','k1','Biologi','Hadir','','u-demo');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a12','2026-07-28','s4','k1','Biologi','Sakit','Sakit kepala','u-demo');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a13','2026-07-28','s5','k1','Biologi','Hadir','','u-demo');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a14','2026-07-28','s6','k1','Biologi','Hadir','','u-demo');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a15','2026-07-28','s7','k1','Biologi','Hadir','','u-demo');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a16','2026-07-30','s9','k2','Matematika','Hadir','','u-guru2');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a17','2026-07-30','s10','k2','Matematika','Hadir','','u-guru2');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a18','2026-07-30','s11','k2','Matematika','Izin','Sakit','u-guru2');
INSERT INTO "absensi" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","status","keterangan","user_id") VALUES('a19','2026-07-30','s12','k2','Matematika','Hadir','','u-guru2');
CREATE TABLE `activity_log` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` text NOT NULL,
	`user_id` text,
	`action` text,
	`description` text
);
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('lg01','2026-08-09 07:50:08','u-admin','SEED','Database direset dan diisi data demo');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('lg02','2026-08-09 07:50:08','u-demo','REGISTER','demo@jurnal.guru mendaftar');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('1d4ff445-1f34-43f3-8c80-b3447ab01361','2026-08-09T07:50:57.068Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('898e3e60-c5f4-4dbc-b6e5-217fc2804f72','2026-08-09T07:50:58.040Z','u-demo','LOGIN','demo@jurnal.guru login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('19cde8cc-b904-43e1-8756-7215c02b2972','2026-08-09T07:51:04.043Z','u-guru2','LOGIN','guru2@jurnal.guru login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('6e5c555f-e532-40c4-a578-ae8ace2e2535','2026-08-09T07:51:16.059Z','u-demo','LOGIN','demo@jurnal.guru login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('4380d9a9-4981-41d2-978f-ac8d3718ebd7','2026-08-09T07:58:43.439Z','236b0fd5-e5b4-4172-a0eb-4a2751a8a312','REGISTER','yestina80@gmail.com mendaftar');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('14dc3080-d07d-4c2e-b730-e599beb0af3c','2026-08-09T08:02:31.590Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('816bda0b-5b66-43cf-b2cc-fa3ee46a93b9','2026-08-09T08:09:41.902Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('3b1948ce-81a0-4195-b718-eab6d002e6d0','2026-08-09T11:39:39.778Z','236b0fd5-e5b4-4172-a0eb-4a2751a8a312','LOGOUT','yestina80@gmail.com logout');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('899ceecb-279c-48ea-94ef-ba3b3a74ca6c','2026-08-09T11:39:42.087Z','236b0fd5-e5b4-4172-a0eb-4a2751a8a312','LOGIN','yestina80@gmail.com login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('9e2e9a61-b63a-4e31-87cf-2dc19bd18d0f','2026-08-09T22:09:53.499Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('8a5fda5c-d560-44c9-a57a-fb4a30bf1592','2026-08-10T00:18:32.252Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('8b6e4364-c5fb-4d5e-abc5-38d54912ae57','2026-08-10T00:24:00.852Z','u-admin','LOGOUT','admin logout');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('13b41ad6-7b9f-4e3d-9632-f2ead88b6e26','2026-08-10T00:24:10.331Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('8eebd99f-a2f9-48c9-a7ac-c48f8fd4c737','2026-08-10T00:24:58.534Z','u-admin','LOGOUT','admin logout');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('01e3b9ae-dd5a-41b5-82eb-f38c24621842','2026-08-10T00:26:56.401Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','REGISTER','candraloka81@gmail.com mendaftar');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('66ef0a05-7155-4e5c-a9f3-4378cd435e11','2026-08-10T00:55:05.748Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGIN','candraloka81@gmail.com login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('14365f08-dce8-40dc-91e0-61f5fe31e1d8','2026-08-10T00:56:20.531Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGOUT','candraloka81@gmail.com logout');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('8087aa6f-9280-44dd-bfbf-f72888154bec','2026-08-10T00:56:25.897Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGIN','candraloka81@gmail.com login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('bbd6e735-7e06-4fca-bee8-e090584ac8fd','2026-08-10T00:56:47.659Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGOUT','candraloka81@gmail.com logout');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('189ebfd9-09f3-44da-b391-7dc04cbf10c5','2026-08-10T00:56:54.090Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('33ec5072-867e-4727-8939-b0d560603373','2026-08-10T00:57:13.272Z','u-admin','UPDATE_USER','Update user candraloka81@gmail.com');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('6c8de77c-f264-4bc8-b461-31174343c4a7','2026-08-10T00:57:25.151Z','u-admin','UPDATE_USER','Update user candraloka81@gmail.com');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('c34bc6dc-15cf-4952-9b48-f9850fc808ab','2026-08-10T01:18:53.980Z','u-admin','LOGOUT','admin logout');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('1ff746f6-97ab-45a6-9380-1513b62db95d','2026-08-10T06:51:51.862Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('e07518d9-f469-48c4-af44-5d246938e56c','2026-08-10T06:52:07.084Z','u-admin','LOGOUT','admin logout');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('f09f48e0-ba41-48da-ba9a-9692a79a98ab','2026-08-10T06:52:19.551Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGIN','candraloka81@gmail.com login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('bd5e3080-83a0-4c7b-907f-2602a9dc3ce5','2026-08-10T09:44:03.135Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('d7e74134-bfd8-4e88-9f39-e1039ef4ecfd','2026-08-10T09:46:50.303Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('a42b0e49-a30c-45a3-82ed-df834775e36b','2026-08-10T09:48:31.679Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGOUT','candraloka81@gmail.com logout');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('1ef3c4c8-8059-41bd-b975-73d5c1801a5b','2026-08-10T09:48:36.258Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGIN','candraloka81@gmail.com login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('72154a29-aaab-4236-a375-0599d60b2427','2026-08-10T09:59:12.554Z','1f45f2c3-d0b5-473b-9f10-9417d3031e69','REGISTER','uji_free@gmail.com mendaftar');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('8e271962-ffd8-4614-a24a-4a2359bc72d7','2026-08-10T09:59:13.667Z','1f45f2c3-d0b5-473b-9f10-9417d3031e69','LOGIN','uji_free@gmail.com login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('27c32f52-2dc7-44a4-a1c7-3cd4186a01a4','2026-08-10T09:59:53.864Z','1f45f2c3-d0b5-473b-9f10-9417d3031e69','UPDATE_PROFIL','Update profil sekolah');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('ce1a04ac-756b-40b4-9b75-538065cae87e','2026-08-10T10:00:32.354Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('2f16b878-3340-4641-8da8-0ced03c897d0','2026-08-10T10:00:33.562Z','u-admin','UPDATE_PROFIL','Update profil sekolah');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('fff5db28-c77f-4452-a986-c1de37290aef','2026-08-10T10:02:13.128Z','u-admin','DELETE_USER','Hapus user uji_free@gmail.com');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('a2a18195-507b-4a6a-883d-5f7e2972bbe8','2026-08-10T10:30:08.908Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('269441d9-b853-4275-9baa-0f11205fae5f','2026-08-10T10:30:53.552Z','8703eb67-b34a-4a28-b3ce-bdaf498be4a3','REGISTER','uji2@gmail.com mendaftar');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('9c5eb172-021c-4236-a138-acfd95d695f5','2026-08-10T10:30:54.317Z','8703eb67-b34a-4a28-b3ce-bdaf498be4a3','LOGIN','uji2@gmail.com login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('82b7ec1d-f97e-4bc5-8dc0-8c83a902979f','2026-08-10T10:30:55.554Z','8703eb67-b34a-4a28-b3ce-bdaf498be4a3','UPDATE_PROFIL','Update profil sekolah');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('7305b339-2bd2-46a5-9be4-6b5a2a366fd8','2026-08-10T10:31:48.070Z','u-admin','DELETE_USER','Hapus user uji2@gmail.com');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('b915877d-c6fe-44ce-aa70-8c9359bf7c61','2026-08-10T10:33:12.281Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGIN','candraloka81@gmail.com login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('bcd5fc53-5813-4fec-8c29-5cf62c3bc613','2026-08-10T10:51:47.699Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','UPDATE_SETTINGS','Update pengaturan');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('1537ab1a-2986-4d41-a89a-19404abb9315','2026-08-10T10:55:04.099Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('56a5b6b7-0243-4c4a-96dd-1942aa55ddbd','2026-08-10T10:55:11.277Z','u-admin','UPDATE_SETTINGS','Update pengaturan');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('f910b0f3-255a-4489-9557-ff4d36d2c56b','2026-08-10T10:55:34.062Z','u-admin','UPDATE_SETTINGS','Update pengaturan');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('1e55ac10-0399-44df-a9c8-2f6d710e7c5c','2026-08-10T10:55:53.526Z','u-admin','LOGOUT','admin logout');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('28b6d8a4-e44a-4c2e-bd63-a5ab5842e33c','2026-08-10T10:57:11.310Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('b9f254c9-d202-4033-b1d5-3517f074d686','2026-08-11T03:28:11.156Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGIN','candraloka81@gmail.com login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('cea0abdc-1317-4812-beca-da907f066cfd','2026-08-11T03:55:01.984Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('9df465b0-d35b-4bc6-91b1-4649a423a0fa','2026-08-11T03:55:03.895Z','u-admin','UPDATE_PROFILE','Update profil');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('b811ddaa-9cc0-4420-8946-ce4588efd46f','2026-08-11T03:55:04.709Z','u-admin','UPDATE_PROFILE','Update profil');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('d429d0cc-f40a-4a3a-a5a7-b340a6e05538','2026-08-11T03:58:42.219Z','u-admin','UPDATE_PROFILE','Update profil');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('caac56c2-f35d-4c11-9912-b18a3c8f0e7c','2026-08-11T03:58:42.979Z','u-admin','UPDATE_PROFILE','Update profil');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('a6ef8840-8034-442e-8869-60fa4f529af9','2026-08-11T03:58:52.245Z','u-admin','UPDATE_PROFILE','Update profil');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('e24cd670-1afb-4ca5-8b8c-e74a5904b595','2026-08-11T06:44:10.504Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGIN','candraloka81@gmail.com login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('79e5cfef-82a4-47f2-a7de-0d3cb1b332ac','2026-08-11T06:48:48.191Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('c261bbf4-dd7f-43b5-8c45-ba665e3bb113','2026-08-11T06:51:21.496Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','UPDATE_PROFILE','Update profil');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('b2bce20d-bd00-4c81-b291-0d95c412a69b','2026-08-11T06:51:44.607Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','UPDATE_PROFILE','Update profil');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('c758a4f8-e619-4bbc-ae47-8499c3d2b035','2026-08-11T06:55:50.828Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGOUT','candraloka81@gmail.com logout');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('5c8d2cc8-34d2-492b-a5a4-00af40f372be','2026-08-11T06:59:59.197Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGIN','candraloka81@gmail.com login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('620ec309-6be4-4f6b-9bc2-a502c75b899e','2026-08-11T21:24:02.189Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGIN','candraloka81@gmail.com login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('c7aa2635-1f6c-4da7-a139-6305c9f53800','2026-08-11T22:02:21.622Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGIN','candraloka81@gmail.com login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('c212769f-3d88-4a4b-a3ee-b1e1bccb984b','2026-08-12T02:27:49.896Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','UPDATE_PROFILE','Update profil');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('ecb1d727-abf1-4fdf-871a-4f66f4984c48','2026-08-12T02:28:14.008Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','UPDATE_PROFILE','Update profil');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('5eae60db-b55c-4166-8514-cdb15e230041','2026-08-12T03:44:18.180Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('8b7712f7-1153-4dd9-99e4-564ea1d0e9a8','2026-08-12T04:00:57.886Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGOUT','candraloka81@gmail.com logout');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('1f18baa6-a0e8-4ebc-b697-ad44256d2220','2026-08-12T04:01:07.096Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGIN','candraloka81@gmail.com login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('935f357b-4b2b-44a3-85ef-d22e0d4de503','2026-08-12T04:04:43.358Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGOUT','candraloka81@gmail.com logout');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('c29c7456-c50f-4c76-8261-29a720d385ba','2026-08-12T06:07:51.571Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGIN','candraloka81@gmail.com login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('994478e0-c65e-4dff-b1cf-350121364883','2026-08-12T06:45:12.231Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('c99c6b67-dd92-4bbc-a0a1-fe3b38f5eb46','2026-08-12T06:49:12.157Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('363ca6bc-a1cd-4dab-89a5-7010f43409f8','2026-08-12T09:36:35.248Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('5a595d8e-3d9a-4396-8aa8-a1cc510cbb00','2026-08-12T10:38:45.976Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('d65a03f5-b56e-416f-a300-76000061185c','2026-08-12T10:39:12.553Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('12ae47be-656b-442d-80a8-26ef9bd338c2','2026-08-12T10:39:30.759Z','u-admin','UPDATE_SETTINGS','Update pengaturan');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('d407f3c1-285a-4792-bfa8-125dd466abfb','2026-08-12T10:51:55.209Z','u-admin','UPDATE_SETTINGS','Update pengaturan');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('e06c8055-0609-4672-a88d-a9a2dcf1d54c','2026-08-12T12:56:08.552Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGOUT','candraloka81@gmail.com logout');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('da6fea04-4f46-4a7a-a610-c0fbae4dc45b','2026-08-12T12:56:10.910Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('8e76cb7e-b1d6-4ffd-a6c2-5e6de9d72f57','2026-08-12T12:56:31.891Z','u-admin','UPDATE_SETTINGS','Update pengaturan');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('48bb2c1c-c2cb-48df-b76b-85240a5fe6cb','2026-08-12T21:16:34.721Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGIN','candraloka81@gmail.com login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('8942e8ea-6c23-44eb-9b99-e9b2d5ad2274','2026-08-12T21:17:08.589Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGOUT','candraloka81@gmail.com logout');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('901feac8-9b5b-42d2-9165-1464f4755840','2026-08-12T21:17:46.586Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('2c5e951c-cd9c-4cf6-974e-143301c81da5','2026-08-12T21:21:21.457Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGIN','candraloka81@gmail.com login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('aca105a0-d4a3-4718-914c-0d5fc4fdb06f','2026-08-12T21:21:28.527Z','8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','LOGOUT','candraloka81@gmail.com logout');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('90664f27-b249-42f7-96ab-b0b57e530494','2026-08-13T00:15:06.044Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('a3b03c5d-b599-4c70-8350-9407288ac034','2026-08-13T00:15:58.333Z','u-admin','LOGIN','admin login');
INSERT INTO "activity_log" ("id","timestamp","user_id","action","description") VALUES('18716ab8-e0ef-4256-a376-e37765b4fd8f','2026-08-13T00:18:36.008Z','u-admin','LOGIN','admin login');
CREATE TABLE `data_kelas` (
	`id` text PRIMARY KEY NOT NULL,
	`nama_kelas` text NOT NULL,
	`tingkat` integer NOT NULL,
	`jurusan` text,
	`tahun_ajaran` text,
	`wali_kelas` text
);
INSERT INTO "data_kelas" ("id","nama_kelas","tingkat","jurusan","tahun_ajaran","wali_kelas") VALUES('k1','X IPA 1',10,'IPA','2026/2027','Dewi Lestari');
INSERT INTO "data_kelas" ("id","nama_kelas","tingkat","jurusan","tahun_ajaran","wali_kelas") VALUES('k2','XI IPS 1',11,'IPS','2026/2027','Budi Santoso');
CREATE TABLE `data_siswa` (
	`id` text PRIMARY KEY NOT NULL,
	`nis` text NOT NULL,
	`nisn` text,
	`nama_siswa` text NOT NULL,
	`jenis_kelamin` text DEFAULT 'L' NOT NULL,
	`kelas_id` text,
	`alamat` text,
	`telepon` text,
	`email` text,
	`nama_ortu` text,
	FOREIGN KEY (`kelas_id`) REFERENCES `data_kelas`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO "data_siswa" ("id","nis","nisn","nama_siswa","jenis_kelamin","kelas_id","alamat","telepon","email","nama_ortu") VALUES('s1','202601001','0111123001','Ahmad Fauzan','L','k1','Jl. Melati No. 1','081234560001','ahmad.fauzan@mail.test','H. Suryadi');
INSERT INTO "data_siswa" ("id","nis","nisn","nama_siswa","jenis_kelamin","kelas_id","alamat","telepon","email","nama_ortu") VALUES('s2','202601002','0111123002','Anisa Rahma','P','k1','Jl. Melati No. 2','081234560002','anisa.rahma@mail.test','Sri Wahyuni');
INSERT INTO "data_siswa" ("id","nis","nisn","nama_siswa","jenis_kelamin","kelas_id","alamat","telepon","email","nama_ortu") VALUES('s3','202601003','0111123003','Bagas Pratama','L','k1','Jl. Kenanga No. 3','081234560003','bagas.pratama@mail.test','Joko Susilo');
INSERT INTO "data_siswa" ("id","nis","nisn","nama_siswa","jenis_kelamin","kelas_id","alamat","telepon","email","nama_ortu") VALUES('s4','202601004','0111123004','Citra Ayu','P','k1','Jl. Kenanga No. 4','081234560004','citra.ayu@mail.test','Rina Kumala');
INSERT INTO "data_siswa" ("id","nis","nisn","nama_siswa","jenis_kelamin","kelas_id","alamat","telepon","email","nama_ortu") VALUES('s5','202601005','0111123005','Dimas Aditya','L','k1','Jl. Mawar No. 5','081234560005','dimas.aditya@mail.test','Agus Prasojo');
INSERT INTO "data_siswa" ("id","nis","nisn","nama_siswa","jenis_kelamin","kelas_id","alamat","telepon","email","nama_ortu") VALUES('s6','202601006','0111123006','Eka Sari','P','k1','Jl. Mawar No. 6','081234560006','eka.sari@mail.test','Tuti Haryati');
INSERT INTO "data_siswa" ("id","nis","nisn","nama_siswa","jenis_kelamin","kelas_id","alamat","telepon","email","nama_ortu") VALUES('s7','202601007','0111123007','Fajar Nugroho','L','k1','Jl. Anggrek No. 7','081234560007','fajar.nugroho@mail.test','Bambang Wibowo');
INSERT INTO "data_siswa" ("id","nis","nisn","nama_siswa","jenis_kelamin","kelas_id","alamat","telepon","email","nama_ortu") VALUES('s8','202601008','0111123008','Gita Permata','P','k1','Jl. Anggrek No. 8','081234560008','gita.permata@mail.test','Dewi Lestari');
INSERT INTO "data_siswa" ("id","nis","nisn","nama_siswa","jenis_kelamin","kelas_id","alamat","telepon","email","nama_ortu") VALUES('s9','202601009','0111123009','Hendra Wijaya','L','k2','Jl. Dahlia No. 9','081234560009','hendra.wijaya@mail.test','Rusdi Hartono');
INSERT INTO "data_siswa" ("id","nis","nisn","nama_siswa","jenis_kelamin","kelas_id","alamat","telepon","email","nama_ortu") VALUES('s10','202601010','0111123010','Intan Permatasari','P','k2','Jl. Dahlia No. 10','081234560010','intan.permata@mail.test','Siti Nurhaliza');
INSERT INTO "data_siswa" ("id","nis","nisn","nama_siswa","jenis_kelamin","kelas_id","alamat","telepon","email","nama_ortu") VALUES('s11','202601011','0111123011','Joko Widodo','L','k2','Jl. Cempaka No. 11','081234560011','joko.widodo@mail.test','H. Slamet');
INSERT INTO "data_siswa" ("id","nis","nisn","nama_siswa","jenis_kelamin","kelas_id","alamat","telepon","email","nama_ortu") VALUES('s12','202601012','0111123012','Kirana Dewi','P','k2','Jl. Cempaka No. 12','081234560012','kirana.dewi@mail.test','Endang Purwanti');
CREATE TABLE `jadwal_mengajar` (
	`id` text PRIMARY KEY NOT NULL,
	`kelas_id` text,
	`mata_pelajaran` text NOT NULL,
	`hari` text NOT NULL,
	`jam_mulai` text,
	`jam_selesai` text,
	`semester` text,
	`ruangan` text,
	FOREIGN KEY (`kelas_id`) REFERENCES `data_kelas`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO "jadwal_mengajar" ("id","kelas_id","mata_pelajaran","hari","jam_mulai","jam_selesai","semester","ruangan") VALUES('jd1','k1','Matematika','Senin','07:00','08:30','1','R.101');
INSERT INTO "jadwal_mengajar" ("id","kelas_id","mata_pelajaran","hari","jam_mulai","jam_selesai","semester","ruangan") VALUES('jd2','k1','Bahasa Indonesia','Senin','08:30','10:00','1','R.101');
INSERT INTO "jadwal_mengajar" ("id","kelas_id","mata_pelajaran","hari","jam_mulai","jam_selesai","semester","ruangan") VALUES('jd3','k1','Biologi','Selasa','07:00','08:30','1','R.Lab');
INSERT INTO "jadwal_mengajar" ("id","kelas_id","mata_pelajaran","hari","jam_mulai","jam_selesai","semester","ruangan") VALUES('jd4','k1','Kimia','Rabu','09:00','10:30','1','R.Lab');
INSERT INTO "jadwal_mengajar" ("id","kelas_id","mata_pelajaran","hari","jam_mulai","jam_selesai","semester","ruangan") VALUES('jd5','k1','Fisika','Kamis','07:00','08:30','1','R.102');
INSERT INTO "jadwal_mengajar" ("id","kelas_id","mata_pelajaran","hari","jam_mulai","jam_selesai","semester","ruangan") VALUES('jd6','k2','Matematika','Senin','10:00','11:30','1','R.103');
CREATE TABLE `jurnal_mengajar` (
	`id` text PRIMARY KEY NOT NULL,
	`tanggal` text,
	`kelas_id` text,
	`mata_pelajaran` text,
	`jam_ke` text,
	`materi` text,
	`deskripsi` text,
	`kendala` text,
	`solusi` text,
	`kehadiran_siswa` text,
	`catatan` text,
	FOREIGN KEY (`kelas_id`) REFERENCES `data_kelas`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO "jurnal_mengajar" ("id","tanggal","kelas_id","mata_pelajaran","jam_ke","materi","deskripsi","kendala","solusi","kehadiran_siswa","catatan") VALUES('j1','2026-07-27','k1','Matematika','1-2','Persamaan Linear Dua Variabel','Pembahasan konsep SPLDV dan contoh soal','Beberapa siswa kesulitan aljabar dasar','Diberikan latihan bertingkat','8 hadir, 1 sakit, 1 izin, 1 alpha','Lanjutkan pertemuan ke-2');
INSERT INTO "jurnal_mengajar" ("id","tanggal","kelas_id","mata_pelajaran","jam_ke","materi","deskripsi","kendala","solusi","kehadiran_siswa","catatan") VALUES('j2','2026-07-28','k1','Biologi','3-4','Struktur Sel','Praktikum pengamatan sel di bawah mikroskop','Jumlah mikroskop terbatas','Siswa dibagi 4 kelompok','8 hadir, 1 sakit','Persiapkan laporan praktikum');
INSERT INTO "jurnal_mengajar" ("id","tanggal","kelas_id","mata_pelajaran","jam_ke","materi","deskripsi","kendala","solusi","kehadiran_siswa","catatan") VALUES('j3','2026-07-30','k2','Matematika','1-2','Eksponen dan Logaritma','Pengenalan sifat-sifat eksponen','Media belum tersedia','Digunakan papan tulis','4 hadir, 1 izin','');
CREATE TABLE `nilai` (
	`id` text PRIMARY KEY NOT NULL,
	`tanggal` text,
	`siswa_id` text,
	`kelas_id` text,
	`mata_pelajaran` text,
	`kategori` text,
	`bab` text,
	`tujuan_pembelajaran` text,
	`bentuk_penugasan` text,
	`nilai` real DEFAULT 0,
	`kkm` real DEFAULT 75,
	`remedial` text,
	FOREIGN KEY (`siswa_id`) REFERENCES `data_siswa`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`kelas_id`) REFERENCES `data_kelas`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO "nilai" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","kategori","bab","tujuan_pembelajaran","bentuk_penugasan","nilai","kkm","remedial") VALUES('n01','2026-07-29','s1','k1','Matematika','Ulangan Harian','Persamaan Linear','Menyelesaikan SPLDV','Tes Tulis',88,75,NULL);
INSERT INTO "nilai" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","kategori","bab","tujuan_pembelajaran","bentuk_penugasan","nilai","kkm","remedial") VALUES('n02','2026-07-29','s2','k1','Matematika','Ulangan Harian','Persamaan Linear','Menyelesaikan SPLDV','Tes Tulis',92,75,NULL);
INSERT INTO "nilai" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","kategori","bab","tujuan_pembelajaran","bentuk_penugasan","nilai","kkm","remedial") VALUES('n03','2026-07-29','s3','k1','Matematika','Ulangan Harian','Persamaan Linear','','Tes Tulis',70,75,NULL);
INSERT INTO "nilai" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","kategori","bab","tujuan_pembelajaran","bentuk_penugasan","nilai","kkm","remedial") VALUES('n04','2026-07-29','s4','k1','Matematika','Ulangan Harian','Persamaan Linear','','Tes Tulis',85,75,NULL);
INSERT INTO "nilai" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","kategori","bab","tujuan_pembelajaran","bentuk_penugasan","nilai","kkm","remedial") VALUES('n05','2026-07-29','s5','k1','Matematika','Ulangan Harian','Persamaan Linear','','Tes Tulis',76,75,NULL);
INSERT INTO "nilai" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","kategori","bab","tujuan_pembelajaran","bentuk_penugasan","nilai","kkm","remedial") VALUES('n06','2026-07-29','s6','k1','Matematika','Ulangan Harian','Persamaan Linear','','Tes Tulis',80,75,NULL);
INSERT INTO "nilai" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","kategori","bab","tujuan_pembelajaran","bentuk_penugasan","nilai","kkm","remedial") VALUES('n07','2026-07-29','s7','k1','Matematika','Ulangan Harian','Persamaan Linear','','Tes Tulis',65,75,NULL);
INSERT INTO "nilai" ("id","tanggal","siswa_id","kelas_id","mata_pelajaran","kategori","bab","tujuan_pembelajaran","bentuk_penugasan","nilai","kkm","remedial") VALUES('n08','2026-07-29','s8','k1','Matematika','Ulangan Harian','Persamaan Linear','','Tes Tulis',90,75,NULL);
CREATE TABLE `profil_sekolah` (
	`id` text PRIMARY KEY NOT NULL,
	`nama_sekolah` text,
	`alamat` text,
	`npsn` text,
	`kota` text,
	`provinsi` text,
	`telepon` text,
	`kepala_sekolah` text,
	`nip_kepsek` text,
	`nama_guru` text,
	`nip_guru` text,
	`logo_url` text
, `user_id` text);
INSERT INTO "profil_sekolah" ("id","nama_sekolah","alamat","npsn","kota","provinsi","telepon","kepala_sekolah","nip_kepsek","nama_guru","nip_guru","logo_url","user_id") VALUES('u-admin','SMA Nusantara Jaya','Jl. Pendidikan No. 1','12345678','Kota Malang','Jawa Timur','0341-000000','Drs. H. Ahmad Fauzi, M.Pd.','197001012000001001','Administrator','','','u-admin');
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
INSERT INTO "settings" ("key","value") VALUES('app_name','Jurnal Guru');
INSERT INTO "settings" ("key","value") VALUES('version','1.0');
INSERT INTO "settings" ("key","value") VALUES('semester','1');
INSERT INTO "settings" ("key","value") VALUES('tahun_ajaran','2026/2027');
INSERT INTO "settings" ("key","value") VALUES('kkm_default','75');
INSERT INTO "settings" ("key","value") VALUES('bank_name','BRI');
INSERT INTO "settings" ("key","value") VALUES('bank_account_number','010001132523504');
INSERT INTO "settings" ("key","value") VALUES('bank_account_name','Jurnal Guru');
INSERT INTO "settings" ("key","value") VALUES('bank_note','Konfirmasi otomatis setelah admin verifikasi bukti transfer.');
INSERT INTO "settings" ("key","value") VALUES('dark_mode','0');
INSERT INTO "settings" ("key","value") VALUES('invite_code','');
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`nama_lengkap` text NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL
, `plan` text DEFAULT 'gratis' NOT NULL, google_sheets_url text, `email` text, `foto` text);
INSERT INTO "users" ("id","username","password_hash","nama_lengkap","role","created_at","plan","google_sheets_url","email","foto") VALUES('u-admin','admin','$2b$10$lQRg58TXFKMdIHMSTL1rnOi2GSvu4zwSTOirbvkIOSKK6krRkuNvS','admin','Admin','2026-08-09 07:50:08','gratis',NULL,NULL,NULL);
INSERT INTO "users" ("id","username","password_hash","nama_lengkap","role","created_at","plan","google_sheets_url","email","foto") VALUES('u-demo','demo@jurnal.guru','$2b$10$AEUAK2Mb9bInVWcKDXswnuoUCGYsEUIzzfjecfvfyUDrmKNvagPny','Dewi Lestari','premium','2026-08-09 07:50:08','premium',NULL,'demo@jurnal.guru',NULL);
INSERT INTO "users" ("id","username","password_hash","nama_lengkap","role","created_at","plan","google_sheets_url","email","foto") VALUES('u-guru2','guru2@jurnal.guru','$2b$10$AEUAK2Mb9bInVWcKDXswnuoUCGYsEUIzzfjecfvfyUDrmKNvagPny','Budi Santoso','free','2026-08-09 07:50:08','gratis',NULL,'guru2@jurnal.guru',NULL);
INSERT INTO "users" ("id","username","password_hash","nama_lengkap","role","created_at","plan","google_sheets_url","email","foto") VALUES('236b0fd5-e5b4-4172-a0eb-4a2751a8a312','yestina80@gmail.com','$2b$10$llrfpXqEvZ20FCDMewEkB.OF9MeXHrRUvWJ3Zie38XjdbQo7l4vpS','Ratn','free','datetime(''now'')','gratis',NULL,'yestina80@gmail.com',NULL);
INSERT INTO "users" ("id","username","password_hash","nama_lengkap","role","created_at","plan","google_sheets_url","email","foto") VALUES('8326b04b-fbc8-41b5-b18b-1b6ebaf482c9','candraloka81@gmail.com','$2b$10$NI2viNfPr5uULVZXNdyLvOaMRCRFio.iPDOLrbQVAHlX4T58Ah4nC','coba','free','datetime(''now'')','gratis',NULL,'candraloka81@gmail.com','data:image/jpeg;base64,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');
CREATE TABLE `data_surat` (
	`id` text PRIMARY KEY NOT NULL,
	`judul` text NOT NULL,
	`jenis` text NOT NULL,
	`tujuan` text,
	`template` text NOT NULL,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	`updated_at` text DEFAULT 'datetime(''now'')' NOT NULL
);
INSERT INTO "data_surat" ("id","judul","jenis","tujuan","template","created_at","updated_at") VALUES('su1','Surat Daftar Hadir','daftar_hadir','','Daftar hadir siswa {kelas} pada {tanggal} sebagai berikut: {daftar}','2026-08-09 07:50:08','2026-08-09 07:50:08');
INSERT INTO "data_surat" ("id","judul","jenis","tujuan","template","created_at","updated_at") VALUES('su2','Surat Keterangan','keterangan','','Surat keterangan bahwa {nama} adalah siswa aktif di {sekolah}.','2026-08-09 07:50:08','2026-08-09 07:50:08');
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subscription_id` text,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'IDR' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_method` text,
	`bank_name` text,
	`account_number` text,
	`account_name` text,
	`proof_url` text,
	`notes` text,
	`verified_at` text,
	`verified_by` text,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`started_at` text NOT NULL,
	`expires_at` text,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `kelompok_belajar` (`id` text PRIMARY KEY NOT NULL, `kelas_id` text, `kelompok` text NOT NULL, `no` text, `siswa_id` text, `nis` text, `nama_siswa` text, `jenis_kelamin` text, `kelas_asal` text, `nilai` text, FOREIGN KEY (`kelas_id`) REFERENCES `data_kelas`(`id`), FOREIGN KEY (`siswa_id`) REFERENCES `data_siswa`(`id`));
INSERT INTO "kelompok_belajar" ("id","kelas_id","kelompok","no","siswa_id","nis","nama_siswa","jenis_kelamin","kelas_asal","nilai") VALUES('kb01','k1','Kelompok A','1','s1','202601001','Ahmad Fauzan','L','X IPA 1','88');
INSERT INTO "kelompok_belajar" ("id","kelas_id","kelompok","no","siswa_id","nis","nama_siswa","jenis_kelamin","kelas_asal","nilai") VALUES('kb02','k1','Kelompok A','2','s2','202601002','Bunga Rahma','P','X IPA 1','92');
INSERT INTO "kelompok_belajar" ("id","kelas_id","kelompok","no","siswa_id","nis","nama_siswa","jenis_kelamin","kelas_asal","nilai") VALUES('kb03','k1','Kelompok A','3','s3','202601003','Bagas Pratama','L','X IPA 1','70');
INSERT INTO "kelompok_belajar" ("id","kelas_id","kelompok","no","siswa_id","nis","nama_siswa","jenis_kelamin","kelas_asal","nilai") VALUES('kb04','k1','Kelompok A','4','s4','202601004','Citra Ayu','P','X IPA 1','85');
INSERT INTO "kelompok_belajar" ("id","kelas_id","kelompok","no","siswa_id","nis","nama_siswa","jenis_kelamin","kelas_asal","nilai") VALUES('kb05','k1','Kelompok B','1','s5','202601005','Dimas Aditya','L','X IPA 1','76');
INSERT INTO "kelompok_belajar" ("id","kelas_id","kelompok","no","siswa_id","nis","nama_siswa","jenis_kelamin","kelas_asal","nilai") VALUES('kb06','k1','Kelompok B','2','s6','202601006','Eka Sari','P','X IPA 1','80');
INSERT INTO "kelompok_belajar" ("id","kelas_id","kelompok","no","siswa_id","nis","nama_siswa","jenis_kelamin","kelas_asal","nilai") VALUES('kb07','k1','Kelompok B','3','s7','202601007','Fajar Nugroho','L','X IPA 1','65');
INSERT INTO "kelompok_belajar" ("id","kelas_id","kelompok","no","siswa_id","nis","nama_siswa","jenis_kelamin","kelas_asal","nilai") VALUES('kb08','k1','Kelompok B','4','s8','202601008','Gita Permata','P','X IPA 1','90');
CREATE TABLE `lckh` (`id` text PRIMARY KEY NOT NULL, `no` text, `kegiatan` text, `pekerjaan` text, `tanggal` text, `jurnal_id` text);
INSERT INTO "lckh" ("id","no","kegiatan","pekerjaan","tanggal","jurnal_id") VALUES('lc01','1','Kegiatan pembelajaran Matematika','Penyusunan materi ajar, pelaksanaan PBM','2026-07-27','j1');
INSERT INTO "lckh" ("id","no","kegiatan","pekerjaan","tanggal","jurnal_id") VALUES('lc02','2','Pembelajaran Biologi - praktikum','Pendampingan praktikum, penilaian laporan','2026-07-28','j2');
INSERT INTO "lckh" ("id","no","kegiatan","pekerjaan","tanggal","jurnal_id") VALUES('lc03','3','Kegiatan penilaian harian','Penyusunan dan koreksi soal','2026-07-29',NULL);
CREATE TABLE `lkb` (`id` text PRIMARY KEY NOT NULL, `no` text, `uraian_tugas` text, `vol` real DEFAULT 0, `bukti_dokumen` text, `bulan` text, `tahun` text);
INSERT INTO "lkb" ("id","no","uraian_tugas","vol","bukti_dokumen","bulan","tahun") VALUES('lb01','1','Penyusunan silabus dan RPP',3,'Dokumen RPP 3 pertemuan','Agustus','2026');
INSERT INTO "lkb" ("id","no","uraian_tugas","vol","bukti_dokumen","bulan","tahun") VALUES('lb02','2','Evaluasi hasil belajar siswa',2,'Analisis nilai ulangan harian','Agustus','2026');
CREATE TABLE `kalender_catatan` (
	`id` text PRIMARY KEY NOT NULL,
	`tanggal` text NOT NULL,
	`isi` text NOT NULL,
	`user_id` text,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	`updated_at` text DEFAULT 'datetime(''now'')' NOT NULL
);
INSERT INTO "kalender_catatan" ("id","tanggal","isi","user_id","created_at","updated_at") VALUES('kc01','2026-08-10','Rapat koordinasi guru (07.00 wib, ruang guru)','u-demo','2026-08-09 07:50:08','2026-08-09 07:50:08');
INSERT INTO "kalender_catatan" ("id","tanggal","isi","user_id","created_at","updated_at") VALUES('kc02','2026-08-18','Batas pengumpulan nilai tengah semester','u-demo','2026-08-09 07:50:08','2026-08-09 07:50:08');
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
CREATE INDEX `profil_sekolah_user_id_idx` ON `profil_sekolah` (`user_id`);
