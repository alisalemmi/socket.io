const Room = require('../model/roomModel');

exports.createRoom = async (req, res, next) => {
  if (!req.body.members)
    return res
      .status(400)
      .json({ status: 'fail', message: 'how is in this room?' });

  if (!Array.isArray(req.body.members)) req.body.members = [req.body.members];

  const room = await Room.create({
    members: [req.user.id, ...req.body.members].map(member => ({
      id: member.id
    }))
  });

  res.status(200).json({ status: 'success', room });
};

/**
 * get rooms and members of all of them of a user
 * @param {string} userId
 * @returns {{rooms: [], members: []}}
 */
exports.getRooms = async userId => {
  if (!userId) return { rooms: [], members: [] };

  const rooms = await Room.aggregate()
    .match({ 'members.id': userId })
    .facet({
      members: [
        {
          $group: {
            _id: '0',
            members: {
              $push: '$members.id'
            }
          }
        },
        {
          $project: {
            _id: false,
            members: {
              $setUnion: {
                $reduce: {
                  input: '$members',
                  initialValue: [],
                  in: { $concatArrays: ['$$value', '$$this'] }
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'members',
            foreignField: '_id',
            as: 'members'
          }
        },
        {
          $unwind: {
            path: '$members',
            preserveNullAndEmptyArrays: true
          }
        }
      ],
      rooms: [
        {
          $lookup: {
            from: 'messages',
            let: { id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$$id', '$room']
                  }
                }
              },
              {
                $sort: { time: -1 }
              },
              {
                $limit: 1
              },
              {
                $project: {
                  _id: false,
                  id: '$_id',
                  sender: true,
                  text: true,
                  time: true,
                  edited: true,
                  quoteRef: true
                }
              }
            ],
            as: 'lastMessage'
          }
        },
        {
          $unwind: {
            path: '$lastMessage',
            preserveNullAndEmptyArrays: true
          }
        }
      ]
    })
    .project({
      members: {
        $map: {
          input: '$members.members',
          as: 'members',
          in: {
            id: '$$members._id',
            name: '$$members.name',
            image: '$$members.image',
            lastSeen: '$$members.lastSeen'
          }
        }
      },
      rooms: {
        $map: {
          input: '$rooms',
          as: 'rooms',
          in: {
            id: '$$rooms._id',
            members: '$$rooms.members',
            lastMessage: '$$rooms.lastMessage'
          }
        }
      }
    });

  return rooms[0];
};
