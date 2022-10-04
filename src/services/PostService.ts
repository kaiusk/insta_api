import { Request, Response } from "express";
import { MariaDB } from "./MariaDB";
import { StatusCodes } from "http-status-codes";

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

  static async getOverview(req: Request, res: Response) {}

  static async getHeader(req: Request, res: Response) {}

  static async getComments(req: Request, res: Response) {}

  static async addComment(req: Request, res: Response) {}

  static async addLike(req: Request, res: Response) {}

  static async addMedia(req: Request, res: Response) {}

  static async addPost(req: Request, res: Response) {}

  static async deletePost(req: Request, res: Response) {}
}
