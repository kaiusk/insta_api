import { Response } from "express";
import { Request } from "express-jwt";
import MariaDB from "./mariaDBService";
import { StatusCodes } from "http-status-codes";
import { validationResult } from "express-validator";

const PostService = {
  // single post
  getPost(req: Request, res: Response): void {
    if (+req.params.id) {
      MariaDB.query(
        `
                    select MP.id                                                                               as postId,
                           MP.locationName,
                           MP.location,
                           MP.creationTime,
                           MU.username,
                           MU.id                                                                               as userId,
                           MU.profileImageUrl,
                           (select count(*) from MI_Liking ML where ML.postId = MP.id)                         as likes,
                           (select count(*) from MI_Comment MC where MC.postId = MP.id)                        as comments,
                           if((select postId from MI_Liking where postId = MP.id and userId = ?), true, false) as liking
                    from MI_Post MP
                             join MI_User MU on MU.id = MP.userId
                    where MP.id = ?
                    order by MP.creationTime desc;

                    select MPM.id, MPM.mediaFileUrl, MPM.mediaTypeID
                    from MI_PostMedia MPM
                             join MI_MediaType MMT on MMT.id = MPM.mediaTypeID
                    where MPM.postId = ?;

                    select MC.id, MC.comment, MC.creationTime, MU.name
                    from MI_Comment MC
                             join MI_User MU on MU.id = MC.userId
                    where MC.postId = ?;
                `,
        [+req.auth?.data.id, +req.params.id, +req.params.id, +req.params.id]
      )
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

  // posts made by my followed users
  getOverview(req: Request, res: Response): void {
    MariaDB.query(
      `
                select MP.id                                                                               as postId,
                       MP.creationTime,
                       MP.locationName,
                       MU.Id                                                                               as userId,
                       MU.username,
                       MU.profileImageUrl,
                       (select count(*) from MI_Liking ML where ML.postId = MP.id)                         as likes,
                       (select count(*) from MI_Comment MC where MC.postId = MP.id)                        as comments,
                       (select MediaFileUrl
                        from MI_PostMedia MPM
                        where MPM.postId = MP.id
                        order by MPM.id desc
                        limit 1)                                                                           as file,
                       if((select postId from MI_Liking where postId = MP.id and userId = ?), true, false) as liking,
                       (select count(MediaFileUrl) from MI_PostMedia MPM where MPM.postId = MP.id)         as files
                from MI_Following MF
                         join MI_Post MP on MF.followeeuserId = MP.userId
                         join MI_User MU on MU.id = MP.userId

                where MF.followerUserId = ?
                group by MP.id, MP.creationTime
                order by MP.creationTime desc`,
      [+req.auth?.data.id, +req.auth?.data.id]
    )
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

  recommend(req: Request, res: Response): void {
    MariaDB.query(
      `select MP.id                                                        as postId,
                    MP.locationName,
                    MP.location,
                    MP.creationTime,
                    MU.username,
                    MU.id                                                        as userId,
                    MU.profileImageUrl,
                    (select count(*) from MI_Liking ML where ML.postId = MP.id)  as likes,
                    (select count(*) from MI_Comment MC where MC.postId = MP.id) as comments,
                    (select mediaFileUrl
                     from MI_PostMedia MPM
                     where MPM.postId = MP.id
                     order by MPM.id desc
                     limit 1)                                                    as file,
                    if((select postId from MI_Liking where postId = MP.id and userId = ?), true,
                       false)                                                    as liking,
                    (select count(mediaFileUrl)
                     from MI_PostMedia MPM
                     where MPM.postId = MP.id)                                   as files
             from MI_Post MP
                      join MI_User MU on MU.id = MP.userId
             where userId in (select followeeuserId
                              from MI_Following
                              where followeruserId in
                                    (select followeeuserId from MI_Following where followeruserId = 107)
                                and followeeuserId <> ?)
             order by rand()
             limit 24`,
      [+req.auth?.data.id, +req.auth?.data.id]
    )
      .then((rows) => {
        res.status(StatusCodes.OK).json(rows);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ message: "user not found" });
      });
  },

  userPosts(req: Request, res: Response): void {
    MariaDB.query(
      `select MP.id                                                        as postId,
                    MP.locationName,
                    MP.creationTime,
                    MU.username,
                    MU.id                                                        as userId,
                    MU.profileImageUrl,
                    (select count(*) from MI_Liking ML where ML.postId = MP.id)  as likes,
                    (select count(*) from MI_Comment MC where MC.postId = MP.id) as comments,
                    (select mediaFileUrl
                     from MI_PostMedia MPM
                     where MPM.postId = MP.id
                     order by MPM.id desc
                     limit 1)                                                    as file,
                    (select count(mediaFileUrl)
                     from MI_PostMedia MPM
                     where MPM.postId = MP.id)                                   as files,
                    if((select postId from MI_Liking where postId = MP.id and userId = ?), true,
                       false)                                                    as liking
             from MI_Post MP
                      join MI_User MU on MU.id = MP.userId
             where userId = ?`,
      [+req.auth?.data.id, +req.params.id]
    )
      .then((rows) => {
        res.status(StatusCodes.OK).json(rows);
      })
      .catch((e) => {
        res.status(StatusCodes.NOT_FOUND).json({ message: "posts not found" });
      });
  },
};

export default PostService;
