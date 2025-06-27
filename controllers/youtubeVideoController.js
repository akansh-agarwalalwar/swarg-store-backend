const YouTubeVideo = require("../models/YouTubeVideo");

// Add a new YouTube video
exports.addVideo = async (req, res) => {
  try {
    const { url, title, description } = req.body;
    // const addedBy = req.user._id;
    const addedByRole = req.user.role === "admin" ? "Admin" : "SubAdmin";
    const video = new YouTubeVideo({
      url,
      title,
      description,
      // addedBy,
      addedByRole,
    });
    await video.save();
    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all YouTube videos
exports.getVideos = async (req, res) => {
  try {
    const videos = await YouTubeVideo.find({});
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a YouTube video
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await YouTubeVideo.findByIdAndDelete(id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    res.json({ message: "Video deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
