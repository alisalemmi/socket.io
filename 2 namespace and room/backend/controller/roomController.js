const Room = require('../model/roomModel');

exports.createRoom = async (req, res, next) => {
  if (!req.body.members)
    return res
      .status(400)
      .json({ status: 'fail', message: 'how is in this room?' });

  if (!Array.isArray(req.body.members)) req.body.members = [req.body.members];

  const room = await Room.create({
    members: [req.user.id, ...req.body.members]
  });

  res.status(200).json({ status: 'success', room });
};

exports.getRooms = async userId => {
  const rooms = await Room.aggregate()
    .match({
      members: userId
    })
    .project({
      _id: false,
      id: '$_id',
      members: {
        $filter: {
          input: '$members',
          as: 'member',
          cond: {
            $ne: ['$$member', userId]
          }
        }
      }
    })
    .lookup({
      from: 'users',
      localField: 'members',
      foreignField: '_id',
      as: 'members'
    });

  return rooms;
};
