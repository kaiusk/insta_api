import { Response } from "express";
import { Request } from "express-jwt";
import MariaDB from "./mariaDBService";
import { StatusCodes } from "http-status-codes";
import { validationResult } from "express-validator";

const PostService = {
  // ühe postituse andmed
  getPost(req: Request, res: Response): void {
    if (+req.params.id) {
      MariaDB.query(`CALL GetPost(?, ?)`, [+req.params.id, +req.auth?.data.id])
        .then((rows) => {
          const response = { ...rows[0][0], media: rows[1], comments: rows[2] };
          res.status(StatusCodes.OK).json(response);
        })
        .catch((e) => {
          res.status(StatusCodes.NOT_FOUND).json({ message: e });
        });
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ message: "post not found" });
    }
  },

  // minu poolt jägitavatate kasutajate postitused
  getOverview(req: Request, res: Response): void {
    MariaDB.query(`CALL Overview(?)`, [+req.auth?.data.id])
      .then((rows) => {
        res.status(StatusCodes.OK).json(rows);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ message: e.message });
      });
  },

  addComment(req: Request, res: Response): void {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    MariaDB.query(
      "insert into MI_Comment (postId, userId, Comment) VALUES (?, ?, ?)",
      [req.params.id, +req.auth?.data.id, req.body.comment]
    )
      .then((result) => {
        return PostService.getPost(req, res);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ error: e.message });
      });
  },

  addLike(req: Request, res: Response): void {
    MariaDB.query("insert into MI_Liking (postId, userId) VALUES (?, ?)", [
      req.params.id,
      +req.auth?.data.id,
    ])
      .then((result) => {
        res.status(StatusCodes.OK).json({ success: true, message: "OK" });
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ error: e.message });
      });
  },

  removeLike(req: Request, res: Response): void {
    MariaDB.query("delete from MI_Liking where postId=? and userId=?", [
      req.params.id,
      +req.auth?.data.id,
    ])
      .then((result) => {
        res.status(StatusCodes.OK).json({ success: true, message: "OK" });
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ error: e.message });
      });
  },

  addPost(req: Request, res: Response): void {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    MariaDB.query("insert into MI_Post (locationName, userId) VALUES (?, ?)", [
      req.body.locationName,
      +req.auth?.data.id,
    ])
      .then((result) => {
        const postId = result.insertId;
        const insert: any[] = [];
        req.body.files.forEach((f: any) => {
          insert.push([postId, f.file, 1]);
        });
        if (insert.length) {
          MariaDB.batch(
            `insert into MI_PostMedia (postId, mediaFileUrl, mediaTypeID)
                         VALUES (?, ?, ?)`,
            insert
          )
            .then((result) => {
              res.status(StatusCodes.CREATED).json(result);
            })
            .catch((e) => {
              res.status(StatusCodes.NOT_FOUND).json({ error: e.message });
            });
        }
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ error: e.message });
      });
  },

  deletePost(req: Request, res: Response): void {
    MariaDB.query("delete from MI_Post where ID= ?", [req.params.id])
      .then((result) => {
        res.status(StatusCodes.OK).json(result);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ error: e.message });
      });
  },

  // postitused mis on tehtud minu poolt jägitavate kasutajate jälgitavate poolt (mina -> follow -> follow)
  recommend(req: Request, res: Response): void {
    MariaDB.query(`call Recommend(?)`, [+req.auth?.data.id])
      .then((rows) => {
        res.status(StatusCodes.OK).json(rows);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ message: "user not found" });
      });
  },

  // ühe kasutaja postitused
  userPosts(req: Request, res: Response): void {
    MariaDB.query(`CALL GetUserPosts(?,?)`, [
      +req.params.id,
      +req.auth?.data.id,
    ])
      .then((rows) => {
        res.status(StatusCodes.OK).json(rows);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ message: "posts not found" });
      });
  },
};

export default PostService;
