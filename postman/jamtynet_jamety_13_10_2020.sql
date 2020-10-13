-- phpMyAdmin SQL Dump
-- version 4.9.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 13, 2020 at 08:02 PM
-- Server version: 10.3.23-MariaDB-cll-lve
-- PHP Version: 7.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jamtynet_jamety`
--

-- --------------------------------------------------------

--
-- Table structure for table `academicYears`
--

CREATE TABLE `academicYears` (
  `id` int(11) NOT NULL,
  `name_ar` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departmentId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academicYears`
--

INSERT INTO `academicYears` (`id`, `name_ar`, `name_en`, `departmentId`, `createdAt`, `updatedAt`) VALUES
(1, 'سنه أولى', '1th', 1, '2020-10-10 22:57:26', '2020-10-10 22:57:26');

-- --------------------------------------------------------

--
-- Table structure for table `assignmentsSubmission`
--

CREATE TABLE `assignmentsSubmission` (
  `id` int(11) NOT NULL,
  `submissionDate` datetime NOT NULL,
  `attachments` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `studentId` int(11) DEFAULT NULL,
  `lessonId` int(11) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 2 COMMENT '0 : Rejected | 1 : Accepted | 2 : Not Reviewed',
  `statusComments` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `configForMobile`
--

CREATE TABLE `configForMobile` (
  `id` int(11) NOT NULL,
  `value` int(11) NOT NULL DEFAULT 0 COMMENT '0 | 1 for mobile app uploading - 0 under review - 1 accepted',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `configForMobile`
--

INSERT INTO `configForMobile` (`id`, `value`, `createdAt`, `updatedAt`) VALUES
(1, 0, '2020-10-11 00:58:52', '2020-10-11 00:58:52');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `name_ar` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `desc` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prerequisiteText` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatYouWillLearn` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numOfLessons` int(11) NOT NULL,
  `numOfHours` double NOT NULL,
  `price` double NOT NULL,
  `priceBeforeDiscount` double DEFAULT NULL,
  `startDate` datetime NOT NULL,
  `type` int(11) NOT NULL COMMENT '0:Subject | 1:Assignment',
  `method` int(11) NOT NULL COMMENT '0:Recorded Lessons | 1:Live Streaming',
  `course_keyword` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `attachement_price` double DEFAULT 0,
  `attachments` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `img` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `vedio` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `subjectId` int(11) DEFAULT NULL,
  `instructorId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `name_ar`, `name_en`, `code`, `desc`, `prerequisiteText`, `whatYouWillLearn`, `numOfLessons`, `numOfHours`, `price`, `priceBeforeDiscount`, `startDate`, `type`, `method`, `course_keyword`, `attachement_price`, `attachments`, `img`, `vedio`, `subjectId`, `instructorId`, `createdAt`, `updatedAt`) VALUES
(2, 'دورة الشبكات الكاملة', 'Network - 1', 'IT 102', 'Network - 1', 'Network - 1', 'Network - 1', 44, 120, 22, 22, '2020-09-20 00:00:00', 0, 1, 'مكثف', 30, 'public/files/Soft and Bio-1602371594117-.xlsx,public/files/Princ of Prog-1602371594119-.xlsx,public/images/IMG_20200920_140225-1602371594160-.jpg,public/images/IMG_20200920_140236-1602371599132-.jpg,public/images/IMG_20200920_140338-1602371602780-.jpg,pub', 'public/images/titleShadow-1024x341-1602371612830-.png', '/videos/466967144', 1, 1, '2020-10-10 23:13:45', '2020-10-10 23:13:45'),
(4, 'إدارة حملات الفيس بوك ', 'إدارة حملات الفيس بوك', 'cs101', '<p><span style=\"color: rgb(60, 59, 55);\">أول دبلومة متكاملة في الوطن العربي عن</span><strong style=\"color: rgb(60, 59, 55);\">&nbsp;ادارة الحملات الاعلانية علي الفيسبوك</strong><span style=\"color: rgb(60, 59, 55);\">&nbsp;في الوطن العربي من البداية حتي</span></p><p><span style=\"color: rgb(60, 59, 55);\"><span class=\"ql-cursor\">﻿</span>الاحتراف ونقوم فيها بالشرح بالغة العربية</span></p>', '<p><span style=\"color: rgb(60, 59, 55);\">لدية حساب شخصي علي الفيس بوك</span></p><p><span style=\"color: rgb(60, 59, 55);\">لدية صفحة علي الفيس بوك</span></p><p><span style=\"color: rgb(60, 59, 55);\"><span class=\"ql-cursor\">﻿</span>لدية فيزا خاصة بالانترنت</span></p>', '<p><span style=\"background-color: rgb(251, 251, 248); color: rgb(60, 59, 55);\">انشاء و ادارة الحملات الاعلانية علي الفيس بوك بشكل احترافي انشاء جميع الحملات الالكترونية للصفحات و المنشورات و المواقع تصميم الاعلانات الخاصة بالحملات الالكترونية دون اللجوء ل', 3, 9, 25, 30, '2020-10-14 00:00:00', 0, 0, 'مكثف', 0, '', 'public/images/image-1602440590547-.jpg', '/videos/467134311', 1, 3, '2020-10-11 18:29:08', '2020-10-11 18:29:08'),
(5, 'إدارة حملات جوجل', 'إدارة حملات جوجل', 'cs102', '<p><strong style=\"color: rgb(60, 59, 55);\">دبلومة إدارة حملات جوجل أدورد الإعلانية,&nbsp;</strong><span style=\"color: rgb(60, 59, 55);\">لتعليم&nbsp;</span><strong style=\"color: rgb(60, 59, 55);\">التسويق الالكتروني باستخدام جوجل أدوردز</strong><span style=\"color: rgb(60, 59, 55);\">&nbsp;علي الانترنت بكل احترافية </span><strong style=\"color: rgb(60, 59, 55);\">سوف نتعلم في دبلومة الحملات الاعلانية لجوجل أدوردز الأتي</strong></p>', '<p><span style=\"color: rgb(60, 59, 55);\">فيزا كارد مفعلة</span></p><p><span style=\"color: rgb(60, 59, 55);\"><span class=\"ql-cursor\">﻿</span>معرفة جيدة بالكمبيوتر و الانترنت</span></p>', '<p><span style=\"background-color: rgb(251, 251, 248); color: rgb(60, 59, 55);\">انشاء حساب اعلاني صحيح علي جوجل أدورد تحليل و استخراج الكلمات المفتاحية للحملة الاعلانية بشكل احترافي انشاء الحملات الاعلانية للموبايلات علي أدوردز التجسس علي المنافسين و تطبيق', 2, 6, 30, 35, '2020-10-12 00:00:00', 0, 1, 'مكثف ', 0, '', 'public/images/image-1602443082654-.jpg', '/videos/467143075', 1, 3, '2020-10-11 19:09:21', '2020-10-11 19:09:21'),
(6, 'دورة أساسيات البرمجة', 'Introducation to Programming', 'CS505', '<ul><li class=\"ql-align-right\">الأشخاص الذين ليس لديهم أي فكرة عن البرمجة من قبل ويودون التعرف على لغة بايثون من باب الفضول</li><li class=\"ql-align-right\">الأشخاص الذين يودون التعرف على البرمجة من باب الفضول</li></ul><p class=\"ql-align-right\"><br></p>', '<p class=\"ql-align-right\"><span style=\"color: rgb(60, 59, 55);\">إمكانية إستخدام الكمبيوتر بشكل عادي</span></p>', '<p class=\"ql-align-right\">هل تريد الدخول لعالم البرمجة وليس لديك أي خبرة مسبقة في هذا المجال؟ هل تبحث عن تطوير مقدراتك البرمجية لتتعلم لغة البايثون؟ هل تريد التعلم بطريقة تساعدك في أن تكون مبرمجاً ناجحاً وليس مجرد إستقبال معلومات؟ هذا الكورس سيساعدك في تح', 10, 5, 250, 300, '2020-10-13 00:00:00', 0, 0, 'مكثف', 20, 'public/images/Capture-1602605895966-.PNG,public/images/2338034_757c_3-1602606477314-.jpg', 'public/images/2338034_757c_3-1602606502088-.jpg', '/videos/467807202', 1, 3, '2020-10-13 16:18:19', '2020-10-13 16:28:22');

-- --------------------------------------------------------

--
-- Table structure for table `courseSubscribes`
--

CREATE TABLE `courseSubscribes` (
  `id` int(11) NOT NULL,
  `studentId` int(11) DEFAULT NULL,
  `courseId` int(11) DEFAULT NULL,
  `groupId` int(11) DEFAULT NULL,
  `details` blob NOT NULL,
  `whichPrice` int(11) NOT NULL COMMENT '0 : price | 1 : attachement_price',
  `paymentResult` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courseSubscribes`
--

INSERT INTO `courseSubscribes` (`id`, `studentId`, `courseId`, `groupId`, `details`, `whichPrice`, `paymentResult`, `createdAt`, `updatedAt`) VALUES
(1, 3, 2, 1, 0x5b7b226e616d655f6172223a224e6574776f726b202d2031222c226e616d655f656e223a224e6574776f726b202d2031222c226e756d4f664c6573736f6e73223a34342c226e756d4f66486f757273223a3132302c227072696365223a32322c2270726963654265666f7265446973636f756e74223a32322c2274797065223a302c226d6574686f64223a312c22636f757273655f6b6579776f7264223a22d985d983d8abd981222c22617474616368656d656e745f7072696365223a33302c22696e7374727563746f72223a7b226e616d655f6172223a224472204172616269222c226e616d655f656e223a224472204172616269222c226d6f62696c65223a223031303031323939353137222c22656d61696c223a2261686d656466617261673139393340676d61696c2e636f6d227d7d2c7b226e616d65223a22d985d987d986d8af20e2808fd98ad8b3d8b1d98a20e2808fd8a7d984d981d982d98a222c226d6f62696c65223a22323031303035383530313532222c22656d61696c223a226d6f68616e65642e79393840676d61696c2e636f6d227d5d, 0, 'CAPTURED', '2020-10-11 00:51:35', '2020-10-11 00:52:00'),
(2, 3, 4, NULL, 0x5b7b226e616d655f6172223a22d8a5d8afd8a7d8b1d8a920d8add985d984d8a7d8aa20d8a7d984d981d98ad8b320d8a8d988d98320222c226e616d655f656e223a22d8a5d8afd8a7d8b1d8a920d8add985d984d8a7d8aa20d8a7d984d981d98ad8b320d8a8d988d983222c226e756d4f664c6573736f6e73223a332c226e756d4f66486f757273223a392c227072696365223a32352c2270726963654265666f7265446973636f756e74223a33302c2274797065223a302c226d6574686f64223a302c22636f757273655f6b6579776f7264223a22d985d983d8abd981222c22617474616368656d656e745f7072696365223a302c22696e7374727563746f72223a7b226e616d655f6172223a22d8a7d8add985d8af20d985d8add985d8af20d8b3d8b9d98ad8af222c226e616d655f656e223a22d8a7d8add985d8af222c226d6f62696c65223a2231323232323232222c22656d61696c223a2261686d656440676d61696c2e636f6d227d7d2c7b226e616d65223a22d8a3d8add985d8af20d8a7d984d8b3d8b9d8afd8a7d988d98a222c226d6f62696c65223a223230313030353835303838222c22656d61696c223a226d6f68616e65642e79393840676d61696c2e636f6d227d5d, 0, 'CAPTURED', '2020-10-11 22:40:17', '2020-10-13 17:12:40'),
(3, 3, 5, 5, 0x5b7b226e616d655f6172223a22d8a5d8afd8a7d8b1d8a920d8add985d984d8a7d8aa20d8acd988d8acd984222c226e616d655f656e223a22d8a5d8afd8a7d8b1d8a920d8add985d984d8a7d8aa20d8acd988d8acd984222c226e756d4f664c6573736f6e73223a322c226e756d4f66486f757273223a362c227072696365223a33302c2270726963654265666f7265446973636f756e74223a33352c2274797065223a302c226d6574686f64223a312c22636f757273655f6b6579776f7264223a22d985d983d8abd98120222c22617474616368656d656e745f7072696365223a302c22696e7374727563746f72223a7b226e616d655f6172223a22d8a7d8add985d8af20d985d8add985d8af20d8b3d8b9d98ad8af222c226e616d655f656e223a22d8a7d8add985d8af222c226d6f62696c65223a2231323232323232222c22656d61696c223a2261686d656440676d61696c2e636f6d227d7d2c7b226e616d65223a22d985d987d986d8af20e2808fd98ad8b3d8b1d98a20e2808fd8a7d984d981d982d98a222c226d6f62696c65223a22323031303035383530313532222c22656d61696c223a226d6f68616e65642e79393840676d61696c2e636f6d227d5d, 0, 'CAPTURED', '2020-10-11 23:00:10', '2020-10-11 23:00:10'),
(4, 3, 6, NULL, 0x5b7b226e616d655f6172223a22d8afd988d8b1d8a920d8a3d8b3d8a7d8b3d98ad8a7d8aa20d8a7d984d8a8d8b1d985d8acd8a9222c226e616d655f656e223a22496e74726f6475636174696f6e20746f2050726f6772616d6d696e67222c226e756d4f664c6573736f6e73223a31302c226e756d4f66486f757273223a352c227072696365223a3235302c2270726963654265666f7265446973636f756e74223a3330302c2274797065223a302c226d6574686f64223a302c22636f757273655f6b6579776f7264223a22d985d983d8abd981222c22617474616368656d656e745f7072696365223a32302c22696e7374727563746f72223a7b226e616d655f6172223a22d8a7d8add985d8af20d985d8add985d8af20d8b3d8b9d98ad8af222c226e616d655f656e223a22d8a7d8add985d8af222c226d6f62696c65223a2231323232323232222c22656d61696c223a2261686d656440676d61696c2e636f6d227d7d2c7b226e616d65223a22d985d987d986d8af20e2808fd98ad8b3d8b1d98a20e2808fd8a7d984d981d982d98a222c226d6f62696c65223a22323031303035383530313532222c22656d61696c223a226d6f68616e65642e79393840676d61696c2e636f6d227d5d, 0, 'CAPTURED', '2020-10-13 16:29:43', '2020-10-13 16:30:13');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name_ar` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facultyId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name_ar`, `name_en`, `bio`, `facultyId`, `createdAt`, `updatedAt`) VALUES
(1, 'تكنولوجيا المعلومات', 'Information Technology', NULL, 1, '2020-10-10 22:57:26', '2020-10-10 22:57:26');

-- --------------------------------------------------------

--
-- Table structure for table `faculties`
--

CREATE TABLE `faculties` (
  `id` int(11) NOT NULL,
  `name_ar` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `universityId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faculties`
--

INSERT INTO `faculties` (`id`, `name_ar`, `name_en`, `bio`, `universityId`, `createdAt`, `updatedAt`) VALUES
(1, 'علوم الحاسب', 'Computer Science', NULL, 1, '2020-10-10 22:57:26', '2020-10-10 22:57:26');

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE `groups` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maxNumOfStudents` int(11) NOT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL,
  `courseId` int(11) DEFAULT NULL,
  `instructorId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `groups`
--

INSERT INTO `groups` (`id`, `name`, `maxNumOfStudents`, `startDate`, `endDate`, `courseId`, `instructorId`, `createdAt`, `updatedAt`) VALUES
(1, 'NEW fffffffff', 24, '2020-11-25 00:00:00', '2020-12-20 00:00:00', 2, 1, '2020-10-10 23:13:45', '2020-10-10 23:13:45'),
(2, 'Group 2', 10, '2020-11-06 00:00:00', '2020-12-01 00:00:00', 2, 1, '2020-10-10 23:15:50', '2020-10-10 23:15:50'),
(3, 'Group 2', 10, '2020-11-06 00:00:00', '2020-12-01 00:00:00', 2, 2, '2020-10-10 23:16:19', '2020-10-10 23:16:19'),
(4, 'Group 2', 10, '2020-11-06 00:00:00', '2020-12-01 00:00:00', 2, 2, '2020-10-10 23:16:34', '2020-10-10 23:16:34'),
(5, 'مجموعه أ ', 10, '2020-10-13 00:00:00', '2020-10-15 00:00:00', 5, 3, '2020-10-11 19:09:21', '2020-10-11 19:09:21'),
(6, 'مجموعة 2', 50, '2020-10-12 00:00:00', '2020-10-31 00:00:00', 5, 3, '2020-10-11 23:10:26', '2020-10-11 23:10:26');

-- --------------------------------------------------------

--
-- Table structure for table `groupSchedules`
--

CREATE TABLE `groupSchedules` (
  `id` int(11) NOT NULL,
  `day` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `time` datetime NOT NULL,
  `groupId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `groupSchedules`
--

INSERT INTO `groupSchedules` (`id`, `day`, `time`, `groupId`, `createdAt`, `updatedAt`) VALUES
(1, 'Friday1', '1994-12-05 13:15:30', 1, '2020-10-10 23:13:45', '2020-10-10 23:13:45'),
(2, 'Friday2', '1994-12-05 13:15:30', 1, '2020-10-10 23:13:45', '2020-10-10 23:13:45'),
(3, 'Friday3', '1994-12-05 13:15:30', 1, '2020-10-10 23:13:45', '2020-10-10 23:13:45'),
(4, 'Friday1', '1994-12-05 13:15:30', 2, '2020-10-10 23:15:50', '2020-10-10 23:15:50'),
(5, 'Friday2', '1998-11-05 13:15:30', 2, '2020-10-10 23:15:50', '2020-10-10 23:15:50'),
(6, 'Friday3', '1984-11-05 13:15:30', 2, '2020-10-10 23:15:50', '2020-10-10 23:15:50'),
(7, 'Friday1', '1994-12-05 13:15:30', 3, '2020-10-10 23:16:19', '2020-10-10 23:16:19'),
(8, 'Friday2', '1998-11-05 13:15:30', 3, '2020-10-10 23:16:19', '2020-10-10 23:16:19'),
(9, 'Friday3', '1984-11-05 13:15:30', 3, '2020-10-10 23:16:19', '2020-10-10 23:16:19'),
(10, 'Friday1', '1994-12-05 13:15:30', 4, '2020-10-10 23:16:34', '2020-10-10 23:16:34'),
(11, 'Friday2', '1998-11-05 13:15:30', 4, '2020-10-10 23:16:34', '2020-10-10 23:16:34'),
(12, 'Friday3', '1984-11-05 13:15:30', 4, '2020-10-10 23:16:34', '2020-10-10 23:16:34'),
(13, 'Monday', '2020-10-12 12:00:00', 5, '2020-10-11 19:09:21', '2020-10-11 19:09:21'),
(14, 'Thursday', '2020-10-15 10:00:00', 5, '2020-10-11 19:09:21', '2020-10-11 19:09:21'),
(15, 'Sunday', '2020-10-13 10:00:00', 6, '2020-10-11 23:10:26', '2020-10-11 23:10:26'),
(16, 'Tuesday', '2020-10-14 10:00:00', 6, '2020-10-11 23:10:26', '2020-10-11 23:10:26'),
(17, 'Thursday', '2020-10-27 10:00:00', 6, '2020-10-11 23:10:26', '2020-10-11 23:10:26');

-- --------------------------------------------------------

--
-- Table structure for table `instructors`
--

CREATE TABLE `instructors` (
  `id` int(11) NOT NULL,
  `name_ar` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cv` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `img` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `userId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `instructors`
--

INSERT INTO `instructors` (`id`, `name_ar`, `name_en`, `bio`, `mobile`, `email`, `cv`, `img`, `userId`, `createdAt`, `updatedAt`) VALUES
(1, 'Dr Arabi', 'Dr Arabi', 'Dr Arabi', '01001299517', 'ahmedfarag1993@gmail.com', 'public/files/orca_share_media1563969304927-a-1602371067205-.pdf', 'public/images/2222-1602371075907-.jpeg', 3, '2020-10-10 23:04:36', '2020-10-10 23:04:36'),
(2, 'Dr Hatem', 'Dr Hatem', 'Dr Hatem', '01001209517', 'drhatem@gmail.com', '', 'public/images/2222-1602371124386-.jpeg', 4, '2020-10-10 23:05:25', '2020-10-10 23:05:25'),
(3, 'احمد محمد سعيد', 'احمد', 'محاضر بخبرة أكثر من 20 عام من التعليم الأكاديمي', '1222222', 'ahmed@gmail.com', '', '', 7, '2020-10-11 16:37:29', '2020-10-11 16:37:29');

-- --------------------------------------------------------

--
-- Table structure for table `lessonDiscussionComments`
--

CREATE TABLE `lessonDiscussionComments` (
  `id` int(11) NOT NULL,
  `text` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `lessonDiscussionId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lessonDiscussionComments`
--

INSERT INTO `lessonDiscussionComments` (`id`, `text`, `userId`, `lessonDiscussionId`, `createdAt`, `updatedAt`) VALUES
(1, 'dvfsdvsvs', 7, 1, '2020-10-11 23:27:15', '2020-10-11 23:27:15');

-- --------------------------------------------------------

--
-- Table structure for table `lessonDiscussions`
--

CREATE TABLE `lessonDiscussions` (
  `id` int(11) NOT NULL,
  `text` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `lessonId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lessonDiscussions`
--

INSERT INTO `lessonDiscussions` (`id`, `text`, `userId`, `lessonId`, `createdAt`, `updatedAt`) VALUES
(1, 'faesfaesfaewg', 7, 3, '2020-10-11 23:27:08', '2020-10-11 23:27:08'),
(2, 'السلام عليكم ،، متى سيتم رفع الشرح للدرس الاخير', 6, 5, '2020-10-13 16:42:24', '2020-10-13 16:42:24');

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `id` int(11) NOT NULL,
  `name_ar` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `desc` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` int(11) DEFAULT NULL COMMENT '0:Assignment | 1:Visual Lesson',
  `assignmentDeadLineDate` datetime DEFAULT NULL,
  `vedio` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `attachments` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `isLiveStreaming` tinyint(1) NOT NULL DEFAULT 0,
  `liveStreamingInfo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `liveStreamingTime` datetime DEFAULT NULL,
  `liveStreamingEndTime` datetime DEFAULT NULL,
  `isAssostatedWithGroup` tinyint(1) NOT NULL DEFAULT 0,
  `groupId` int(11) DEFAULT NULL,
  `courseId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`id`, `name_ar`, `name_en`, `desc`, `type`, `assignmentDeadLineDate`, `vedio`, `attachments`, `isLiveStreaming`, `liveStreamingInfo`, `liveStreamingTime`, `liveStreamingEndTime`, `isAssostatedWithGroup`, `groupId`, `courseId`, `createdAt`, `updatedAt`) VALUES
(1, 'مقدمه عن الحملات الاعلانيه', 'مقدمه عن الحملات الاعلانيه', '<p>مقدمه عن الحملات الاعلانيه هذا الدرس يوفر معلومات عن الحملات الاعلانيه <strong style=\"background-color: rgb(255, 255, 255); color: rgb(32, 33, 34);\">الحملة الإعلانية</strong><span style=\"background-color: rgb(255, 255, 255); color: rgb(32, 33, 34);\">&n', 1, '0000-00-00 00:00:00', '/videos/467138224', 'public/files/pdf-1602441964050-.pdf', 0, '', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 0, NULL, 4, '2020-10-11 18:46:11', '2020-10-11 18:46:11'),
(2, 'شرح المقرر 1', 'شرح المقرر 1', '<p class=\"ql-align-right\">شرح المقرر 1</p>', 1, '0000-00-00 00:00:00', '', 'public/images/GooglePlayIcon-1602457079345-.jpg', 1, 'Test', '2020-10-12 10:00:00', '2020-10-28 10:00:00', 0, NULL, 4, '2020-10-11 22:57:59', '2020-10-11 22:57:59'),
(3, 'شرح المقرر 1', 'شرح المقرر 1', '<p class=\"ql-align-right\">شرح المقرر 1</p>', 1, '0000-00-00 00:00:00', '', 'public/images/GooglePlayIcon-1602457139127-.jpg', 1, 'شرح المقرر 1', '2020-10-12 10:00:00', '2020-10-12 13:00:00', 1, 5, 5, '2020-10-11 22:58:59', '2020-10-11 22:58:59'),
(4, 'حمله اعلانيه لصفحه ', 'حمله اعلانيه لصفحه ', '<p>فى هذا الدرس يتم تقديم اهم الاهداف فى الحملات الاعلانيه للصفحه و بعد نهايه الدرس يتم عمل حمله اعلانيه للصفحه </p>', 1, '0000-00-00 00:00:00', '/videos/467410959', 'public/files/pdf-1602517807934-.pdf', 0, '', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 0, NULL, 4, '2020-10-12 15:50:14', '2020-10-12 15:50:14'),
(5, 'مقدمة عن الدورة', 'Introduction to the course', '<ul><li class=\"ql-align-right\">الأشخاص الذين ليس لديهم أي فكرة عن البرمجة من قبل ويودون التعرف على لغة بايثون من باب الفضول</li><li class=\"ql-align-right\">الأشخاص الذين يودون التعرف على البرمجة من باب الفضول</li></ul><p class=\"ql-align-right\"><br></p>', 1, '0000-00-00 00:00:00', '/videos/467808633', 'public/images/Capture-1602606129279-.PNG', 0, '', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 0, NULL, 6, '2020-10-13 16:22:12', '2020-10-13 16:22:12'),
(6, 'مقدمه فى برمجه الكائنات', 'مقدمه فى برمجه الكائنات', '<p>يقدم هذا الدرس شرح كامل على برمجه الكائنات </p>', 1, '0000-00-00 00:00:00', '/videos/467812673', 'public/files/pdf-1602606790579-.pdf', 0, '', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 0, NULL, 6, '2020-10-13 16:33:17', '2020-10-13 16:33:17'),
(7, 'مقدمة للدورة', 'Introduction to the course', '<p class=\"ql-align-right\">مقدمة لدورة</p>', 1, '0000-00-00 00:00:00', '', '', 1, 'https://us04web.zoom.us/postattendee', '2020-10-14 10:00:00', '2020-10-14 11:00:00', 0, NULL, 4, '2020-10-13 17:09:38', '2020-10-13 17:09:38'),
(8, 'مقدمة للدورة و الملخص', 'Summary', '<p class=\"ql-align-right\">سيتم شرح ملخص سريع للدورة</p>', 1, '0000-00-00 00:00:00', '', 'public/images/cache7f71f491-3893-44c3-b036-4278e35851ad-1602609347815-.jpg', 1, 'https://us04web.zoom.us/postattendee', '2020-10-14 10:00:00', '2020-10-14 11:00:00', 1, 5, 5, '2020-10-13 17:15:49', '2020-10-13 17:15:49');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `courseSubscribeId` int(11) DEFAULT NULL,
  `PaymentID` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Result` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PostDate` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TranID` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Ref` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TrackID` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Auth` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `OrderID` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `courseSubscribeId`, `PaymentID`, `Result`, `PostDate`, `TranID`, `Ref`, `TrackID`, `Auth`, `OrderID`, `createdAt`, `updatedAt`) VALUES
(1, 1, '101202028561245896', 'CANCELED', '', '', '', '65f338d866f7db4c22adef502db2eb4d', '', 'd665fd59fbdca9e61563502140beb99a964edd7c7f0ea74abf', '2020-10-11 00:52:00', '2020-10-11 00:52:00'),
(2, 2, '101202028628014718', 'CANCELED', '', '', '', '64a66420167374699a580304067b1251', '', 'c7f27c545bbf30c7dfa254c871a3381d20fb0aca193b72a002', '2020-10-11 22:40:43', '2020-10-11 22:40:43'),
(3, 4, '101202028796700127', 'CANCELED', '', '', '', 'b4e1e118793215164419719b19be4ea1', '', '632caa7b2a97878f171dfd8ec01b9d480b8be118fced5e6943', '2020-10-13 16:30:13', '2020-10-13 16:30:13'),
(4, 2, '101202028795425547', 'CANCELED', '', '', '', 'd478bdc1099b28578c0050690b90cb55', '', 'cb627b64cb26fe671cdf0e0ced2a349a12f6ea9b7923ede145', '2020-10-13 17:12:40', '2020-10-13 17:12:40');

-- --------------------------------------------------------

--
-- Table structure for table `RatingAndReviews`
--

CREATE TABLE `RatingAndReviews` (
  `id` int(11) NOT NULL,
  `date` datetime NOT NULL,
  `reviewText` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rate` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `courseSubscribeId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `RatingAndReviews`
--

INSERT INTO `RatingAndReviews` (`id`, `date`, `reviewText`, `rate`, `courseSubscribeId`, `createdAt`, `updatedAt`) VALUES
(1, '2020-10-11 00:00:00', 'good and clear explaination', '4', 1, '2020-10-11 13:50:23', '2020-10-11 13:50:23'),
(2, '2020-10-13 00:00:00', 'الشرح متميز', '4', 4, '2020-10-13 16:42:53', '2020-10-13 16:42:53');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name_ar` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name_ar`, `name_en`, `createdAt`, `updatedAt`) VALUES
(1, 'مدير', 'admin', '2020-10-10 22:57:26', '2020-10-10 22:57:26'),
(2, 'طالب', 'student', '2020-10-10 22:57:26', '2020-10-10 22:57:26'),
(3, 'محاضر', 'instructor', '2020-10-10 22:57:26', '2020-10-10 22:57:26');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mobile` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `img` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `userId` int(11) DEFAULT NULL,
  `academicYearId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `name`, `mobile`, `email`, `img`, `userId`, `academicYearId`, `createdAt`, `updatedAt`) VALUES
(1, 'Salma', '01053300317', 'Salma@gmail.com', 'public/images/2-1602370887700-.jpeg', 1, 1, '2020-10-10 23:01:27', '2020-10-10 23:01:27'),
(2, 'Mohamed', '01013300317', 'Mohamed@gmail.com', 'public/images/download-1602370916380-.jpeg', 2, 1, '2020-10-10 23:01:56', '2020-10-10 23:01:56'),
(3, 'أحمد السعداوي', '20100585088', 'mohaned.y98@gmail.com', 'public/images/image_picker4129284815434727021-1602607554836-.jpg', 6, 1, '2020-10-11 00:42:12', '2020-10-13 16:45:54');

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `name_ar` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `academicYearId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `name_ar`, `name_en`, `academicYearId`, `createdAt`, `updatedAt`) VALUES
(1, 'البرمجة', 'Programming', 1, '2020-10-10 22:57:26', '2020-10-10 22:57:26'),
(2, 'قواعد البيانات', 'Databases', 1, '2020-10-10 22:57:26', '2020-10-10 22:57:26');

-- --------------------------------------------------------

--
-- Table structure for table `universities`
--

CREATE TABLE `universities` (
  `id` int(11) NOT NULL,
  `name_ar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `universities`
--

INSERT INTO `universities` (`id`, `name_ar`, `name_en`, `createdAt`, `updatedAt`) VALUES
(1, 'جامعه الكويت', 'Kweit Universtiy', '2020-10-10 22:57:26', '2020-10-10 22:57:26');

-- --------------------------------------------------------

--
-- Table structure for table `userRoles`
--

CREATE TABLE `userRoles` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `roleId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `userRoles`
--

INSERT INTO `userRoles` (`id`, `userId`, `roleId`, `createdAt`, `updatedAt`) VALUES
(1, 1, 2, '2020-10-10 23:01:27', '2020-10-10 23:01:27'),
(2, 2, 2, '2020-10-10 23:01:56', '2020-10-10 23:01:56'),
(3, 3, 3, '2020-10-10 23:04:36', '2020-10-10 23:04:36'),
(4, 4, 3, '2020-10-10 23:05:25', '2020-10-10 23:05:25'),
(5, 5, 1, '2020-10-10 23:07:24', '2020-10-10 23:07:24'),
(6, 6, 2, '2020-10-11 00:42:12', '2020-10-11 00:42:12'),
(7, 7, 3, '2020-10-11 16:37:29', '2020-10-11 16:37:29');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accessToken` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notificationToken` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isVerified` tinyint(1) NOT NULL DEFAULT 0,
  `lastVerificationCodeSend` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lasVerificationCodeCreatedAt` datetime NOT NULL,
  `lasVerificationCodeExpireAt` datetime NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `accessToken`, `notificationToken`, `isVerified`, `lastVerificationCodeSend`, `lasVerificationCodeCreatedAt`, `lasVerificationCodeExpireAt`, `createdAt`, `updatedAt`) VALUES
(1, 'Salma', 'Salma@gmail.com', '$2a$08$FdmGN.tZP5y/jVRTJEul8u68pcBD0Blm8v8/bQSg.ksfEi1ISb3bO', NULL, NULL, 1, '911738', '2020-10-10 23:01:27', '2020-10-11 23:01:27', '2020-10-10 23:01:27', '2020-10-10 23:01:27'),
(2, 'Mohamed', 'Mohamed@gmail.com', '$2a$08$CTGQ1vaU33Pd0JRqLnxtG.7EkAITPSHqQbhEQgHjPxWCRz9v6JIty', NULL, NULL, 1, '604498', '2020-10-10 23:01:56', '2020-10-11 23:01:56', '2020-10-10 23:01:56', '2020-10-10 23:01:56'),
(3, 'drarabi', 'ahmedfarag1993@gmail.com', '$2a$08$RqupY04Y39n/YTNUeTUjSOqhXYoqnP8qs7/9y0J5cbdtceqAfS/h2', NULL, NULL, 1, '135572', '2020-10-10 23:04:36', '2020-10-11 23:04:36', '2020-10-10 23:04:36', '2020-10-10 23:06:01'),
(4, 'drhatem', 'drhatem@gmail.com', '$2a$08$swTrG2RrLbwb/WS6kueptuLSV6kORIaTQM5M4DpHS41Thf7Rw22FS', NULL, NULL, 1, '278365', '2020-10-10 23:05:25', '2020-10-11 23:05:25', '2020-10-10 23:05:25', '2020-10-10 23:05:25'),
(5, 'admin', 'admin@gmail.com', '$2a$08$sHSU3FQwUW1s2m3TGIBvZOa3WCwSF9e6Kc9hf8K9M9/NS36zbA9D6', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlcyI6WyJhZG1pbiJdLCJpbnN0cnVjdG9ySWQiOm51bGwsInN0dWRlbnRJZCI6bnVsbCwiaWF0IjoxNjAyNjExOTY2LCJleHAiOjE2MDI2OTgzNjZ9.st-_a6a1Yn0mymgdQgk1trmG7OQbj4yx6lfJ2k37N5k', NULL, 1, '531486', '2020-10-10 23:07:24', '2020-10-11 23:07:24', '2020-10-10 23:07:24', '2020-10-13 17:59:26'),
(6, 'student1', 'mohaned.y98@gmail.com', '$2a$08$LCloGGEos9SSJcgndIcXnOqdlFo5vfvlb4Ki568Y4.0IxSVykUB9O', NULL, NULL, 1, '795091', '2020-10-11 00:42:12', '2020-10-12 00:42:12', '2020-10-11 00:42:12', '2020-10-13 16:45:54'),
(7, 'ahmed', 'ahmed@gmail.com', '$2a$08$bD6ofXAQOvzaSUT.ozevk.r5alNFPc0qM.bleh2oSPDizeZbKdBbi', NULL, NULL, 1, '688161', '2020-10-11 16:37:29', '2020-10-12 16:37:29', '2020-10-11 16:37:29', '2020-10-11 16:37:29');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academicYears`
--
ALTER TABLE `academicYears`
  ADD PRIMARY KEY (`id`),
  ADD KEY `departmentId` (`departmentId`);

--
-- Indexes for table `assignmentsSubmission`
--
ALTER TABLE `assignmentsSubmission`
  ADD PRIMARY KEY (`id`),
  ADD KEY `studentId` (`studentId`),
  ADD KEY `lessonId` (`lessonId`);

--
-- Indexes for table `configForMobile`
--
ALTER TABLE `configForMobile`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subjectId` (`subjectId`),
  ADD KEY `instructorId` (`instructorId`);

--
-- Indexes for table `courseSubscribes`
--
ALTER TABLE `courseSubscribes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `studentId` (`studentId`),
  ADD KEY `courseId` (`courseId`),
  ADD KEY `groupId` (`groupId`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `facultyId` (`facultyId`);

--
-- Indexes for table `faculties`
--
ALTER TABLE `faculties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `universityId` (`universityId`);

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `courseId` (`courseId`),
  ADD KEY `instructorId` (`instructorId`);

--
-- Indexes for table `groupSchedules`
--
ALTER TABLE `groupSchedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `groupId` (`groupId`);

--
-- Indexes for table `instructors`
--
ALTER TABLE `instructors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `instructors_email_unique` (`email`),
  ADD UNIQUE KEY `instructors_mobile_unique` (`mobile`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `lessonDiscussionComments`
--
ALTER TABLE `lessonDiscussionComments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `lessonDiscussionId` (`lessonDiscussionId`);

--
-- Indexes for table `lessonDiscussions`
--
ALTER TABLE `lessonDiscussions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `lessonId` (`lessonId`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `groupId` (`groupId`),
  ADD KEY `courseId` (`courseId`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `courseSubscribeId` (`courseSubscribeId`);

--
-- Indexes for table `RatingAndReviews`
--
ALTER TABLE `RatingAndReviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `courseSubscribeId` (`courseSubscribeId`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_ar_unique` (`name_ar`),
  ADD UNIQUE KEY `roles_name_en_unique` (`name_en`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `students_email_unique` (`email`),
  ADD UNIQUE KEY `students_mobile_unique` (`mobile`),
  ADD KEY `userId` (`userId`),
  ADD KEY `academicYearId` (`academicYearId`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `academicYearId` (`academicYearId`);

--
-- Indexes for table `universities`
--
ALTER TABLE `universities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `universities_name_ar_unique` (`name_ar`),
  ADD UNIQUE KEY `universities_name_en_unique` (`name_en`);

--
-- Indexes for table `userRoles`
--
ALTER TABLE `userRoles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userRoles_roleId_userId_unique` (`userId`,`roleId`),
  ADD KEY `roleId` (`roleId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academicYears`
--
ALTER TABLE `academicYears`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `assignmentsSubmission`
--
ALTER TABLE `assignmentsSubmission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `configForMobile`
--
ALTER TABLE `configForMobile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `courseSubscribes`
--
ALTER TABLE `courseSubscribes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `faculties`
--
ALTER TABLE `faculties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `groups`
--
ALTER TABLE `groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `groupSchedules`
--
ALTER TABLE `groupSchedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `instructors`
--
ALTER TABLE `instructors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `lessonDiscussionComments`
--
ALTER TABLE `lessonDiscussionComments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `lessonDiscussions`
--
ALTER TABLE `lessonDiscussions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `RatingAndReviews`
--
ALTER TABLE `RatingAndReviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `universities`
--
ALTER TABLE `universities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `userRoles`
--
ALTER TABLE `userRoles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `academicYears`
--
ALTER TABLE `academicYears`
  ADD CONSTRAINT `academicYears_ibfk_1` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `assignmentsSubmission`
--
ALTER TABLE `assignmentsSubmission`
  ADD CONSTRAINT `assignmentsSubmission_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `students` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `assignmentsSubmission_ibfk_2` FOREIGN KEY (`lessonId`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`subjectId`) REFERENCES `subjects` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`instructorId`) REFERENCES `instructors` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `courseSubscribes`
--
ALTER TABLE `courseSubscribes`
  ADD CONSTRAINT `courseSubscribes_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `students` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `courseSubscribes_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `courseSubscribes_ibfk_3` FOREIGN KEY (`groupId`) REFERENCES `groups` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`facultyId`) REFERENCES `faculties` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `faculties`
--
ALTER TABLE `faculties`
  ADD CONSTRAINT `faculties_ibfk_1` FOREIGN KEY (`universityId`) REFERENCES `universities` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `groups`
--
ALTER TABLE `groups`
  ADD CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `groups_ibfk_2` FOREIGN KEY (`instructorId`) REFERENCES `instructors` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `groupSchedules`
--
ALTER TABLE `groupSchedules`
  ADD CONSTRAINT `groupSchedules_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `instructors`
--
ALTER TABLE `instructors`
  ADD CONSTRAINT `instructors_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lessonDiscussionComments`
--
ALTER TABLE `lessonDiscussionComments`
  ADD CONSTRAINT `lessonDiscussionComments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `lessonDiscussionComments_ibfk_2` FOREIGN KEY (`lessonDiscussionId`) REFERENCES `lessonDiscussions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lessonDiscussions`
--
ALTER TABLE `lessonDiscussions`
  ADD CONSTRAINT `lessonDiscussions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `lessonDiscussions_ibfk_2` FOREIGN KEY (`lessonId`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `groups` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `lessons_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`courseSubscribeId`) REFERENCES `courseSubscribes` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `RatingAndReviews`
--
ALTER TABLE `RatingAndReviews`
  ADD CONSTRAINT `RatingAndReviews_ibfk_1` FOREIGN KEY (`courseSubscribeId`) REFERENCES `courseSubscribes` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`academicYearId`) REFERENCES `academicYears` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`academicYearId`) REFERENCES `academicYears` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `userRoles`
--
ALTER TABLE `userRoles`
  ADD CONSTRAINT `userRoles_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `userRoles_ibfk_2` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
