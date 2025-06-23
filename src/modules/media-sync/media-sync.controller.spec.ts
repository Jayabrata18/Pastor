import { Test, TestingModule } from '@nestjs/testing';
import { MediaSyncController } from './media-sync.controller';

describe('MediaSyncController', () => {
  let controller: MediaSyncController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaSyncController],
    }).compile();

    controller = module.get<MediaSyncController>(MediaSyncController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
