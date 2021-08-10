-- bans definition

CREATE TABLE `bans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `steam_id` varchar(20) NOT NULL,
  `reason` text DEFAULT NULL,
  `moderator` text NOT NULL,
  `banned_from` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;