import fs from "fs";
import util from "util";
import path from "path";
import { pipeline } from "stream";
import { Property } from "../../models/property.js";

const pump = util.promisify(pipeline);

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

const sanitizeFilename = function (filename) {
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
};

const isPropertyOwner = function (property, req) {
  const user_id = req.user.id;
  return property.user_id === user_id;
};

export const addImagesProperty = async function (req, res) {
  const property_id = req.params.id;
  try {
    const property = await Property.findOne({ property_id });
    if (!property) {
      return res.status(404).send({ message: "Error: Can't find property." });
    }

    if (!isPropertyOwner(property, req)) {
      return res.status(401).send({ message: "Error: you do not own the property." });
    }

    const parts = await req.files();
    for await (const data of parts) {
      if (!ALLOWED_MIME_TYPES.includes(data.mimetype)) {
        return res.status(400).send({ message: "Error: Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed." });
      }
      const safeName = sanitizeFilename(data.filename);
      const imgName = new Date().getTime() + "-" + safeName;
      const targetPath = path.join(UPLOADS_DIR, imgName);
      const resolvedPath = path.resolve(targetPath);
      if (!resolvedPath.startsWith(path.resolve(UPLOADS_DIR))) {
        return res.status(400).send({ message: "Error: Invalid file path." });
      }
      fs.statSync("uploads/");
      await pump(data.file, fs.createWriteStream(resolvedPath));
      const image =
        req.protocol + "://" + req.headers.host + "/uploads/" + imgName;
      property.images.push(image);
      await property.save();
    }
    return res.status(201).send({ data: property.images });
  } catch (error) {
    return res.status(500).send({ message: "Error: Something went wrong uploading images." });
  }
};

export const deleteImagesProperty = async function (req, res) {
  const property_id = req.params.id;
  const { images } = req.body;
  try {
    const property = await Property.findOne({ property_id });
    if (!property) {
      return res.status(404).send({ message: "Error: Can't find property." });
    }

    if (!isPropertyOwner(property, req)) {
      return res.status(401).send({ message: "Error: you do not own the property." });
    }

    property.images = property.images.filter(
      (img) => !images.includes(img)
    );
    await property.save();
    unlinkImages(images);
    return res.send({ data: images });
  } catch (error) {
    return res.status(500).send({ message: "Error: Something went wrong deleting images." });
  }
};

export const unlinkImages = function (propertyImages = []) {
  const images = propertyImages.map((img) => {
    const imgSplt = img.split("/");
    return sanitizeFilename(imgSplt[imgSplt.length - 1]);
  });
  images.forEach((img) => {
    const targetPath = path.join(UPLOADS_DIR, img);
    const resolvedPath = path.resolve(targetPath);
    if (!resolvedPath.startsWith(path.resolve(UPLOADS_DIR))) {
      return;
    }
    fs.unlink(resolvedPath, (err) => {
      if (err) {
        console.log(err);
        return;
      }
    });
  });
};
