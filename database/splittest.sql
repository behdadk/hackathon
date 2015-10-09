-- phpMyAdmin SQL Dump
-- version 4.4.14
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Oct 09, 2015 at 10:22 AM
-- Server version: 5.6.26
-- PHP Version: 5.6.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `splittest`
--

-- --------------------------------------------------------

--
-- Table structure for table `Session`
--

CREATE TABLE IF NOT EXISTS `Session` (
  `ID` int(11) NOT NULL,
  `SessionString` varchar(40) NOT NULL,
  `SplitTest_ID` int(11) NOT NULL,
  `Variation_ID` int(11) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Session`
--

INSERT INTO `Session` (`ID`, `SessionString`, `SplitTest_ID`, `Variation_ID`) VALUES
(4, 'otheruniquesessionstring', 1, 2),
(5, 'otheruniquesessionstring', 3, 8),
(6, 'otheruniquesessionstring', 4, 11),
(8, 'otheruniquesessionstring', 5, 11),
(1, 'uniquesessionstring', 1, 1),
(2, 'uniquesessionstring', 2, 5),
(3, 'uniquesessionstring', 3, 9),
(7, 'uniquesessionstring', 5, 11);

-- --------------------------------------------------------

--
-- Table structure for table `splittest`
--

CREATE TABLE IF NOT EXISTS `splittest` (
  `ID` int(11) NOT NULL,
  `URL` varchar(255) DEFAULT NULL,
  `ElementID` varchar(255) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `splittest`
--

INSERT INTO `splittest` (`ID`, `URL`, `ElementID`) VALUES
(1, 'http://www.coolblue.nl', '/html/body/div[1]'),
(2, 'http://www.coolblue.nl', '/html/body/div[2]/span'),
(3, 'http://www.coolblue.nl/category', '/html/body/div[3]/div'),
(4, 'http://www.coolblue.nl/product', '/html/body/div[5]/div/div'),
(5, 'http://www.coolblue.nl/cart', '/html/body/div[5]/div[2]');

-- --------------------------------------------------------

--
-- Table structure for table `variation`
--

CREATE TABLE IF NOT EXISTS `variation` (
  `ID` int(11) NOT NULL,
  `SplitTest_ID` int(11) NOT NULL,
  `Title` varchar(255) NOT NULL,
  `Content` text
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `variation`
--

INSERT INTO `variation` (`ID`, `SplitTest_ID`, `Title`, `Content`) VALUES
(1, 1, 'Inverted Variation', 'This is the inverted content'),
(2, 1, 'Slightly Different Variation', 'This is the slight different content'),
(3, 1, 'Completetly Different Variation', 'This is the completely different content'),
(4, 2, 'Randomized Position', 'Those are the randomized positions'),
(5, 2, 'Inversion', 'Those are the inverted positions'),
(6, 2, 'First two switched', 'First two modules are switched'),
(7, 3, 'First Big', 'Showcase with first big'),
(8, 3, 'Second Big', 'Showcase with second big'),
(9, 3, 'All medium', 'Showcase with all medium'),
(10, 4, '2 1 3', 'First two switched'),
(11, 4, '2 3 1', 'Order 2 3 1'),
(12, 4, '3 2 1', 'Inverted order'),
(13, 4, '1 3 2', 'Last two switched'),
(14, 5, 'Before and after', 'Both'),
(15, 5, 'Only after', 'Single');

-- --------------------------------------------------------

--
-- Table structure for table `visit`
--

CREATE TABLE IF NOT EXISTS `visit` (
  `ID` int(11) NOT NULL,
  `Timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Session_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `visit`
--

INSERT INTO `visit` (`ID`, `Timestamp`, `Session_ID`) VALUES
(1, '2015-10-09 07:38:37', 1),
(2, '2015-10-09 07:38:44', 2),
(3, '2015-10-09 07:38:55', 3),
(4, '2015-10-09 07:39:12', 4),
(5, '2015-10-09 07:39:13', 5),
(6, '2015-10-09 07:39:25', 6),
(7, '2015-10-09 07:39:44', 7),
(8, '2015-10-09 07:39:46', 8),
(9, '2015-10-09 07:39:50', 5),
(10, '2015-10-09 07:39:51', 1),
(11, '2015-10-09 07:39:52', 3),
(12, '2015-10-09 07:39:53', 6),
(13, '2015-10-09 07:39:54', 5),
(14, '2015-10-09 07:39:55', 7),
(15, '2015-10-09 07:39:56', 1),
(16, '2015-10-09 07:39:57', 4),
(17, '2015-10-09 07:39:58', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Session`
--
ALTER TABLE `Session`
  ADD PRIMARY KEY (`SessionString`,`SplitTest_ID`),
  ADD UNIQUE KEY `ID_UNIQUE` (`ID`),
  ADD KEY `fk_Session_SplitTest1_idx` (`SplitTest_ID`),
  ADD KEY `fk_Session_Variation1_idx` (`Variation_ID`);

--
-- Indexes for table `splittest`
--
ALTER TABLE `splittest`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `variation`
--
ALTER TABLE `variation`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `fk_Variation_SplitTest_idx` (`SplitTest_ID`);

--
-- Indexes for table `visit`
--
ALTER TABLE `visit`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `fk_Visit_Session` (`Session_ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Session`
--
ALTER TABLE `Session`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT for table `splittest`
--
ALTER TABLE `splittest`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `variation`
--
ALTER TABLE `variation`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=16;
--
-- AUTO_INCREMENT for table `visit`
--
ALTER TABLE `visit`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=18;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `Session`
--
ALTER TABLE `Session`
  ADD CONSTRAINT `fk_Session_SplitTest1` FOREIGN KEY (`SplitTest_ID`) REFERENCES `SplitTest` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_Session_Variation1` FOREIGN KEY (`Variation_ID`) REFERENCES `Variation` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `variation`
--
ALTER TABLE `variation`
  ADD CONSTRAINT `fk_Variation_SplitTest` FOREIGN KEY (`SplitTest_ID`) REFERENCES `SplitTest` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `visit`
--
ALTER TABLE `visit`
  ADD CONSTRAINT `fk_Visit_Session` FOREIGN KEY (`Session_ID`) REFERENCES `session` (`ID`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
