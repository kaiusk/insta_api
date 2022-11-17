import { Request, Response } from "express";
import MariaDB from "./mariaDBService";
import { StatusCodes } from "http-status-codes";

const StatService = {
  getTopUsers(req: Request, res: Response) {
    MariaDB.query(
      "select MU.Username, MU.Name, count(MF.FollowerUserID) as fallowers\n" +
        "from MI_Following MF\n" +
        "         join MI_User MU on MU.ID = MF.FolloweeUserID\n" +
        "group by MF.FolloweeUserID\n" +
        "order by fallowers desc\n" +
        "limit 10"
    )
      .then((rows) => {
        res.status(StatusCodes.OK).json(rows);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ message: "post not found" });
      });
  },
  getGenders(req: Request, res: Response) {
    MariaDB.query(
      "select MG.Name as gender, count(MU.ID) as users\n" +
        "from MI_User MU\n" +
        "         join MI_Gender MG on MG.ID = MU.GenderID\n" +
        "group by MU.GenderID"
    )
      .then((rows) => {
        res.status(StatusCodes.OK).json(rows);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ message: "post not found" });
      });
  },
  getUsersAdded(req: Request, res: Response) {
    MariaDB.query(
      "select date(MU.CreationTime) as date, count(MU.ID) as users\n" +
        "from MI_User MU\n" +
        "group by 1"
    )
      .then((rows) => {
        res.status(StatusCodes.OK).json(rows);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ message: "post not found" });
      });
  },
  getStats(req: Request, res: Response) {
    MariaDB.query(
      `select count(MP.ID)                          as posts,
                    (select count(MU.ID) from MI_User MU) as users,
                    (select count(MP2.ID) / count(distinct MP2.UserID)
                     from MI_Post MP2)                    as avgPosts,
                    (select count(MP2.ID)
                     from MI_Post MP2
                     group by MP2.UserID
                     order by 1 desc
                     limit 1)                             as maxPosts,
                    (select count(MC2.ID) / count(distinct MC2.PostID)
                     from MI_Comment MC2)                 as avgComments,
                    (select count(MC2.ID)
                     from MI_Comment MC2
                     group by MC2.PostID
                     order by 1 desc
                     limit 1)                             as maxComments,
                    (select count(ML2.PostID) / count(distinct ML2.PostID)
                     from MI_Liking ML2)                  as avgLikes,
                    (select count(ML2.UserID)
                     from MI_Liking ML2
                     group by ML2.PostID
                     order by 1 desc
                     limit 1)                             as maxLikes
             from MI_Post MP`
    )
      .then((rows) => {
        res.status(StatusCodes.OK).json(rows[0]);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ message: "post not found" });
      });
  },
};

export default StatService;
