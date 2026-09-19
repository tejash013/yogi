import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { connectDatabase } from '../db.js';
import MenuItem from '../models/MenuItem.js';
const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: resolve(backendRoot, '.env') });
dotenv.config({ path: resolve(backendRoot, 'atlas-credentials.env') });
async function cleanupDuplicateMenuItems() {
    await connectDatabase();
    const groups = await MenuItem.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: {
                    restaurantId: '$restaurantId',
                    branchId: '$branchId',
                    title: { $toLower: { $trim: { input: '$title' } } },
                },
                items: { $push: { _id: '$_id', createdAt: '$createdAt' } },
                count: { $sum: 1 },
            },
        },
        { $match: { count: { $gt: 1 } } },
    ]).exec();
    let deactivated = 0;
    for (const group of groups) {
        const sorted = [...group.items].sort((a, b) => {
            const left = a.createdAt?.getTime() ?? 0;
            const right = b.createdAt?.getTime() ?? 0;
            return right - left;
        });
        const duplicateIds = sorted.slice(1).map((item) => item._id);
        if (duplicateIds.length > 0) {
            await MenuItem.updateMany({ _id: { $in: duplicateIds } }, { $set: { isActive: false } }).exec();
            deactivated += duplicateIds.length;
            console.log(`Kept ${sorted[0]._id} for ${group._id.title}; deactivated ${duplicateIds.length}`);
        }
    }
    console.log(`Duplicate menu cleanup complete. Groups: ${groups.length}; deactivated: ${deactivated}`);
    await mongoose.disconnect();
}
cleanupDuplicateMenuItems().catch(async (error) => {
    console.error('Duplicate menu cleanup failed:', error);
    await mongoose.disconnect().catch(() => undefined);
    process.exitCode = 1;
});
