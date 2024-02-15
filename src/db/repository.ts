import { Poll } from './models';
import { Db } from 'mongodb';

export class PollRepository {
    private collection = 'polls';

    constructor(private db: Db) {}

    async get(pollId: string): Promise<Poll | null> {
        const result = await this.db.collection(this.collection).findOne({ pollId });
        return result as Poll | null;
    }

    async create(poll: Poll): Promise<Poll> {
        const existingPoll = await this.get(poll.pollId);
        if (!existingPoll) {
            await this.db.collection(this.collection).insertOne(poll);
        }
        return poll;
    }

    async update(newPoll: Poll): Promise<Poll | null> {
        const existingPoll = await this.get(newPoll.pollId);
        if (!existingPoll) {
            await this.create(newPoll);
            
        } else {
            for (let i = 0; i < existingPoll.votes.length; i++) {
                const existingVoters = existingPoll.votes[i].voters;
                const newVoters = newPoll.votes[i].voters;
                const voters = [...existingVoters, ...newVoters];
                const uniqueVoters = [...new Set(voters)];
                newPoll.votes[i].voters = uniqueVoters;
            }
            await this.db.collection(this.collection).updateOne({ pollId: newPoll.pollId }, { $set: newPoll });
        }
        return newPoll;
    }
}