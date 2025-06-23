import { Test, TestingModule } from '@nestjs/testing';
import { MediaSyncService } from './media-sync.service';

describe('MediaSyncService', () => {
  let service: MediaSyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaSyncService],
    }).compile();

    service = module.get<MediaSyncService>(MediaSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
