import type { NextFunction, Request, Response } from 'express';
import Card from '../models/card/card';
import User from '../models/user/user';
import ApiError from '../exceptions/api-error';

class CardsController {
  static async getCards(req: Request, res: Response, next: NextFunction) {
    try {
      const cards = await Card.find().populate(['owner']);
      return res.status(200).json({ cards });
    } catch (err) {
      next(err);
    }
  }

  static async createCard(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, link } = req.body;
      const { _id } = req.user;

      if (!name || !link) {
        throw ApiError.BadRequest('fill in all fields');
      }

      const card = await Card.create({
        name,
        link,
        owner: _id,
      });

      return res.status(200).json({ card });
    } catch (err) {
      next(err);
    }
  }

  static async deleteCard(req: Request, res: Response, next: NextFunction) {
    try {
      const { cardId } = req.params;
      const { _id } = req.user;

      const findCard = await Card.findById(cardId);

      if (!findCard) {
        throw ApiError.NotFound('card not found');
      }

      const ownerId = findCard?.owner.toString();

      if (ownerId !== _id) {
        throw ApiError.Forbidden();
      }

      const removedCard = await findCard!?.deleteOne();

      return res.status(200).json({
        removedCard,
        message: 'card was removed',
      });
    } catch (err) {
      next(err);
    }
  }

  static async setLike(req: Request, res: Response, next: NextFunction) {
    try {
      const { cardId } = req.params;
      const { _id } = req.user;

      const candidate = await User.findById(_id);
      const findCard = await Card.findById(cardId);

      if (!candidate) {
        throw ApiError.NotFound('user not exists');
      }

      if (!findCard) {
        throw ApiError.NotFound('card not found');
      }

      const likedCard = await Card.findByIdAndUpdate(
        cardId,
        { $addToSet: { likes: _id } },
        { new: true },
      );

      return res.status(200).json(likedCard);
    } catch (err) {
      next(err);
    }
  }

  static async removeLike(req: Request, res: Response, next: NextFunction) {
    try {
      const { cardId } = req.params;
      const { _id } = req.user;

      const candidate = await User.findById(_id);
      const findCard = await Card.findById(cardId);

      if (!candidate) {
        throw ApiError.NotFound('user not exists');
      }

      if (!findCard) {
        throw ApiError.NotFound('card not found');
      }

      const likedCard = await Card.findByIdAndUpdate(
        cardId,
        { $pull: { likes: _id } },
        { new: true },
      );

      return res.status(200).json(likedCard);
    } catch (err) {
      next(err);
    }
  }
}

export default CardsController;