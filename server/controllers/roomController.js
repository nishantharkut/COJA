const Room = require("../models/roomModel.js");

// Create a new room
const createRoom = async (req, res) => {
  try {
    const { name,  description, language } = req.body;

    const room = await Room.create({
      name,
      description: description || "",
      language: language || "JavaScript",
      createdBy: req.user._id,
      users: [req.user._id],
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create room', error: error.message });
  }
};

// Get all public rooms
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false }).populate('users', 'name email').populate("createdBy", "name email");;
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rooms' });
  }
};

// Get a single room by ID
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('users', 'name email').populate("createdBy", "name email");;

    if (!room) return res.status(404).json({ message: 'Room not found' });

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch room' });
  }
};

// Join a room
const joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (!room.users.includes(req.user._id)) {
      room.users.push(req.user._id);
      await room.save();
    }

    res.status(200).json({ message: 'Joined room', room });
  } catch (error) {
    res.status(500).json({ message: 'Failed to join room' });
  }
};

// Leave a room
const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.users = room.users.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );

    await room.save();

    res.status(200).json({ message: 'Left room' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to leave room' });
  }
};

// Get rooms created by the user
const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ createdBy: req.user._id }).populate("createdBy", "name email");;
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your rooms' });
  }
};

// Search rooms by name or description
const searchRooms = async (req, res) => {
  try {
    const { query } = req.query;
    const regex = new RegExp(query, "i");

    const rooms = await Room.find({
      isPrivate: false,
      $or: [{ name: regex }, { description: regex }],
    });

    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Failed to search rooms' });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  joinRoom,
  leaveRoom,
  getMyRooms,
  searchRooms,
};
