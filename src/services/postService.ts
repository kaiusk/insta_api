import { Request, Response } from "express";
import { MariaDB } from "./mariaDBService";
import { StatusCodes } from "http-status-codes";
import { validationResult } from "express-validator";

export default class PostService {
  static async getPost(req: Request, res: Response) {
    if (+req.params.id) {
      return MariaDB.query(
        "select MP.ID, MP.CreationTime, MU.Username, count(ML.UserID) as likes, MPM.MediaTypeID, MPM.MediaFileUrl\n" +
          "from MI_Following MF\n" +
          "         join MI_Post MP on MF.FolloweeUserID = MP.UserID\n" +
          "         join MI_User MU on MU.ID = MP.UserId\n" +
          "         left join MI_Liking ML on MP.ID = ML.PostID\n" +
          "         inner join MI_PostMedia MPM on MP.ID = MPM.PostID\n" +
          "where MF.FollowerUserID = ?\n" +
          "group by MP.ID, MP.CreationTime\n" +
          "order by MP.CreationTime desc;",
        [+req.params.id]
      )
        .then((rows) => {
          res.status(StatusCodes.OK).json(rows);
        })
        .catch((e) => {
          res.status(StatusCodes.NOT_FOUND).json({ message: "post not found" });
        });
    } else
      res.status(StatusCodes.NOT_FOUND).json({ message: "post not found" });
  }

  static async getOverview(req: Request, res: Response) {
    return MariaDB.query(
      "select MU.Username, MU.Name, MU.ProfileImageUrl, count(ML.PostID) as likes\n" +
        "from MI_Post MP\n" +
        "         join MI_User MU on MU.ID = MP.UserID\n" +
        "         left join MI_Liking ML on ML.PostID = MP.ID\n" +
        "where MP.ID = ?\n" +
        "group by MP.ID",
      [+req.params.id]
    )
      .then((rows) => {
        res.status(StatusCodes.OK).json(rows);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ message: "post not found" });
      });
  }

  static async getMedia(req: Request, res: Response) {
    return MariaDB.query(
      "select MPM.ID, MPM.MediaFileUrl, MMT.Name\n" +
        "from MI_PostMedia MPM\n" +
        "         join MI_MediaType MMT on MMT.ID = MPM.MediaTypeID\n" +
        "where MPM.PostID = ?",
      [+req.params.id]
    )
      .then((rows) => {
        res.status(StatusCodes.OK).json(rows);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ message: "post not found" });
      });
  }

  static async getComments(req: Request, res: Response) {
    return MariaDB.query(
      "select MC.ID, MC.Comment, MC.CreationTime, MU.Name\n" +
        "from MI_Comment MC\n" +
        "         join MI_User MU on MU.ID = MC.UserID\n" +
        "where MC.PostID =?",
      [+req.params.id]
    )
      .then((rows) => {
        res.status(StatusCodes.OK).json(rows);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ message: "post not found" });
      });
  }

  static async addComment(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }
    return MariaDB.query(
      "insert into MI_Comment (PostID, UserID, Comment) VALUES (?, ?, ?)",
      // @ts-ignore
      [req.params.id, +req.auth?.data.ID, req.body.comment]
    )
      .then((result) => {
        res.status(StatusCodes.CREATED).json(result);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ error: e.message });
      });
  }

  static async addLike(req: Request, res: Response) {
    return MariaDB.query(
      "insert into MI_Liking (PostID, UserID) VALUES (?, ?)",
      // @ts-ignore
      [req.params.id, +req.auth?.data.ID]
    )
      .then((result) => {
        res.status(StatusCodes.CREATED).json(result);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ error: e.message });
      });
  }

  static async removeLike(req: Request, res: Response) {
    return MariaDB.query(
      "delete from MI_Liking where PostID=? and UserID=?",
      // @ts-ignore
      [req.params.id, +req.auth?.data.ID]
    )
      .then((result) => {
        res.status(StatusCodes.OK).json(result);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ error: e.message });
      });
  }

  static async addMedia(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }
    return MariaDB.query(
      "insert into MI_PostMedia (PostID, MediaFileUrl, MediaTypeID) VALUES (?, ?, ?)",
      [req.params.id, req.body.fileUrl, req.body.fileTypeId]
    )
      .then((result) => {
        res.status(StatusCodes.CREATED).json(result);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ error: e.message });
      });
  }

  static async addPost(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }
    return MariaDB.query(
      "insert into MI_Post (Location, LocationName, UserID) VALUES (?, ?, ?)",
      // @ts-ignore
      [req.body.location, req.body.locationName, +req.auth?.data.ID]
    )
      .then((result) => {
        res.status(StatusCodes.CREATED).json(result);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ error: e.message });
      });
  }

  static async deletePost(req: Request, res: Response) {
    return MariaDB.query("delete from MI_Post where ID= ?", [req.params.id])
      .then((result) => {
        res.status(StatusCodes.OK).json(result);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ error: e.message });
      });
  }
}
