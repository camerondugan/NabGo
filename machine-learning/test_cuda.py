"""Extra file used to verify if CUDA is available"""
import torch

print(torch.cuda.is_available())
a = torch.cuda.FloatTensor()
