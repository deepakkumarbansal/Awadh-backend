import visitorCount from "../models/visitCount.model.js";

// Get the current visit count
const getVisitCount = async (req, res) => {
  try {
    let visitCount = await visitorCount.findOne();

    // If no count is found in the database, set a default of 813129
    if (!visitCount) {
      visitCount = new visitorCount({ count: 813129 });
      await visitCount.save(); // Save the default count to the database
    }

    return res.status(200).json({ count: visitCount.count });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error retrieving visit count", error });
  }
};

// Update the visit count
const updateVisitCount = async (req, res) => {
  try {
    let visitCount = await visitorCount.findOne();

    if (!visitCount) {
      visitCount = new visitorCount({ count: 813129 });
    } else {
      visitCount.count += 1;
    }

    await visitCount.save();
    return res.status(200).json({ count: visitCount.count });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating visit count", error });
  }
};

export { getVisitCount, updateVisitCount };
